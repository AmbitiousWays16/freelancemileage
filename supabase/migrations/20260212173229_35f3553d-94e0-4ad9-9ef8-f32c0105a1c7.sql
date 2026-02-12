-- Make gas-receipts bucket private to protect sensitive financial documents
UPDATE storage.buckets SET public = false WHERE id = 'gas-receipts';