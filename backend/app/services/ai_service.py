import google.generativeai as genai
from app.core.config import settings
from typing import Optional

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


async def generate_summary(
    text: str,
    summary_type: str = "standard",
    max_tokens: Optional[int] = None
) -> tuple[str, int]:
    """Generate a summary using OpenAI API."""
    
    # Define prompts based on summary type
    prompts = {
        "brief": "Provide a brief 2-3 sentence summary of the following document:",
        "standard": "Provide a comprehensive summary of the following document, highlighting the key points and main ideas:",
        "detailed": "Provide a detailed summary of the following document, including all major points, supporting details, and conclusions:"
    }
    
    prompt = prompts.get(summary_type, prompts["standard"])
    
    # Truncate text if too long (Gemini 1.5 Flash supports up to 1M tokens)
    max_input_length = 200000  # characters (Gemini has much larger context)
    if len(text) > max_input_length:
        text = text[:max_input_length] + "..."
    
    try:
        # Initialize Gemini model - use gemini-2.5-flash for v1 API
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Create the full prompt
        full_prompt = f"""You are a helpful assistant that creates clear, concise summaries of documents.

{prompt}

{text}"""
        
        # Generate summary
        response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens or (150 if summary_type == "brief" else 500 if summary_type == "standard" else 1000),
                temperature=0.3,
            )
        )
        
        # Handle response parts properly
        if response.candidates:
            summary = ""
            for part in response.candidates[0].content.parts:
                summary += part.text
        else:
            summary = response.text
            
        # Gemini doesn't return token count in same way, estimate it
        tokens_used = len(text.split()) + len(summary.split())  # Rough estimate
        
        return summary, tokens_used
    
    except Exception as e:
        raise Exception(f"Error generating summary with Gemini: {str(e)}")


async def generate_summary_with_context(
    text: str,
    document_title: str,
    summary_type: str = "standard"
) -> tuple[str, int]:
    """Generate a summary with document context."""
    
    context = f"Document Title: {document_title}\n\n"
    return await generate_summary(context + text, summary_type)
