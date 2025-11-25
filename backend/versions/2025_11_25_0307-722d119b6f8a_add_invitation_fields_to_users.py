"""add_invitation_fields_to_users

Revision ID: 722d119b6f8a
Revises: 3c9cf7c5adeb
Create Date: 2025-11-25 03:07:13.803151+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '722d119b6f8a'
down_revision: Union[str, None] = '3c9cf7c5adeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add invitation fields to users table
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table('users', schema=None) as batch_op:
        # Check if columns exist before adding (for SQLite idempotency)
        from sqlalchemy import inspect
        conn = op.get_bind()
        inspector = inspect(conn)
        existing_columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'is_pending_invitation' not in existing_columns:
            batch_op.add_column(sa.Column('is_pending_invitation', sa.Boolean(), nullable=False, server_default='0'))
        
        if 'invitation_token' not in existing_columns:
            batch_op.add_column(sa.Column('invitation_token', sa.String(), nullable=True))
    
    # Create unique index on invitation_token if it doesn't exist
    from sqlalchemy import inspect
    conn = op.get_bind()
    inspector = inspect(conn)
    existing_indexes = [idx['name'] for idx in inspector.get_indexes('users')]
    
    if 'ix_users_invitation_token' not in existing_indexes:
        op.create_index('ix_users_invitation_token', 'users', ['invitation_token'], unique=True)


def downgrade() -> None:
    # Remove invitation fields
    op.drop_index('ix_users_invitation_token', table_name='users')
    
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('invitation_token')
        batch_op.drop_column('is_pending_invitation')
