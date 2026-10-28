ALTER TABLE admin_accounts
  MODIFY email VARCHAR(254) NOT NULL,
  ADD UNIQUE KEY uq_admin_accounts_email (email)
