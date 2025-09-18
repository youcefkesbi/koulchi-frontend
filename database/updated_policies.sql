
-- 5. Recreate the dropped policies
-- Packs
CREATE POLICY "Admins can manage packs"
ON packs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Features
CREATE POLICY "Admins can manage features"
ON features
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Employees can view features"
ON features
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

CREATE POLICY "Employees can update features"
ON features
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

-- Pack Features
CREATE POLICY "Admins can manage pack features"
ON pack_features
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Employees can view pack features"
ON pack_features
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

CREATE POLICY "Employees can update pack features"
ON pack_features
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

-- Verifications
CREATE POLICY "Employees can view all verifications"
ON verifications
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

CREATE POLICY "Employees can update verification status"
ON verifications
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

-- Profiles
CREATE POLICY "Employees can view profiles"
ON profiles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

CREATE POLICY "Admins and employees can view all profiles"
ON profiles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','employee')
));

CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Stores
CREATE POLICY "Employees can view all stores"
ON stores
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

CREATE POLICY "Employees can update store status"
ON stores
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
));

-- Storage Objects (for category icons / verification documents)
CREATE POLICY "Admins can update category icons"
ON storage.objects
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete category icons"
ON storage.objects
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Employees can view category icons"
ON storage.objects
FOR SELECT
USING (bucket_id = 'category-icons'
   AND EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
   ));

CREATE POLICY "Employees can update category icons"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'category-icons'
   AND EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() AND profiles.role = 'employee'
   ));

CREATE POLICY "Employees and admins can view verification documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'verification-documents'
   AND EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() AND profiles.role IN ('employee','admin')
   ));

CREATE POLICY "Admins can insert category icons"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'category-icons'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
);