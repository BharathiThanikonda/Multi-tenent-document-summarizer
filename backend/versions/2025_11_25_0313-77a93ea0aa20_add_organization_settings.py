"""add_organization_settings

Revision ID: 77a93ea0aa20
Revises: 722d119b6f8a
Create Date: 2025-11-25 03:13:53.995372+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77a93ea0aa20'
down_revision: Union[str, None] = '722d119b6f8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add organization settings fields
    with op.batch_alter_table('organizations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('auto_generate_summaries', sa.Boolean(), nullable=False, server_default='1'))
        batch_op.add_column(sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('require_approval', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('two_factor_auth', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('document_retention_days', sa.Integer(), nullable=False, server_default='90'))
        batch_op.add_column(sa.Column('allow_data_export', sa.Boolean(), nullable=False, server_default='1'))


def downgrade() -> None:
    # Remove organization settings fields
    with op.batch_alter_table('organizations', schema=None) as batch_op:
        batch_op.drop_column('allow_data_export')
        batch_op.drop_column('document_retention_days')
        batch_op.drop_column('two_factor_auth')
        batch_op.drop_column('require_approval')
        batch_op.drop_column('email_notifications')
        batch_op.drop_column('auto_generate_summaries')
