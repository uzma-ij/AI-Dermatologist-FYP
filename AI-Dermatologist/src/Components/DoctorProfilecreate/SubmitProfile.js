import { supabase } from '../../supabase';

export const submitProfileToSupabase = async (formData, uploadFiles, userId, isResubmission = false) => {
  const timestamp = Date.now();

  const uploadToStorage = async (file, label) => {
    if (!file) return null;
    const filePath = `profiles/${timestamp}_${label}`;
    const { data, error } = await supabase.storage
      .from('profileuploads')
      .upload(filePath, file);
    if (error) {
      console.error(`Error uploading ${label}:`, error.message);
      return null;
    }
    
    const { data: publicUrlData } = supabase
      .storage
      .from('profileuploads')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const pmcCertificateUrl = await uploadToStorage(uploadFiles.pmcCertificate, 'pmc_certificate');
  const housejobCertUrl = await uploadToStorage(uploadFiles.houseJobCertificate, 'house_job_certificate');
  const cnicFrontUrl = await uploadToStorage(uploadFiles.cnicFront, 'cnic_front');
  const cnicBackUrl = await uploadToStorage(uploadFiles.cnicBack, 'cnic_back');
  const photoUrl = await uploadToStorage(uploadFiles.profilePhoto, 'profile_photo');

  const profileData = {
    ...formData,
    approvalStatus: "Pending",
  };

  // Only update URLs if new files were uploaded
  if (pmcCertificateUrl) profileData.pmcCertificateUrl = pmcCertificateUrl;
  if (housejobCertUrl) profileData.housejobCertUrl = housejobCertUrl;
  if (cnicFrontUrl) profileData.cnicFrontUrl = cnicFrontUrl;
  if (cnicBackUrl) profileData.cnicBackUrl = cnicBackUrl;
  if (photoUrl) profileData.photoUrl = photoUrl;

  let error;
  if (isResubmission) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('ProfileforApproval')
      .update(profileData)
      .eq('id', userId);
    error = updateError;
  } else {
    // Insert new record
    const { error: insertError } = await supabase
      .from('ProfileforApproval')
      .insert([{
        ...profileData,
        id: userId,
      }]);
    error = insertError;
  }

  return error;
};
