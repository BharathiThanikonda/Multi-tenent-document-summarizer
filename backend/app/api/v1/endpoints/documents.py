from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentWithText
from app.services.document_service import save_uploaded_file, extract_text_from_file, delete_file

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document."""
    # Validate file type
    if file.content_type not in settings.allowed_file_types_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed types: {settings.ALLOWED_FILE_TYPES}"
        )
    
    # Read file content
    file_content = await file.read()
    file_size = len(file_content)
    
    # Validate file size
    if file_size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB"
        )
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create organization-specific upload directory
    org_upload_dir = os.path.join(settings.UPLOAD_DIR, current_user.organization_id)
    
    # Save file
    try:
        file_path = await save_uploaded_file(file_content, unique_filename, org_upload_dir)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create document record
    document = Document(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file_size,
        organization_id=current_user.organization_id,
        uploaded_by=current_user.id,
        status="uploaded"
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Extract text in background (simplified - should use Celery)
    try:
        extracted_text, page_count = await extract_text_from_file(file_path, file.content_type)
        document.extracted_text = extracted_text
        document.page_count = page_count
        document.status = "completed"
        db.commit()
        db.refresh(document)
    except Exception as e:
        print(f"Text extraction error: {str(e)}")
        document.status = "failed"
        document.extracted_text = f"Error: {str(e)}"
        db.commit()
        db.refresh(document)
    
    return document


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List all documents in the organization."""
    documents = db.query(Document).filter(
        Document.organization_id == current_user.organization_id
    ).offset(skip).limit(limit).all()
    
    return documents


@router.get("/{document_id}", response_model=DocumentWithText)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific document."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file from disk
    await delete_file(document.file_path)
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download/view a document file."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.organization_id == current_user.organization_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk"
        )
    
    return FileResponse(
        path=document.file_path,
        filename=document.original_filename,
        media_type=document.file_type
    )
