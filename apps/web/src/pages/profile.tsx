import { useState } from 'react';
import { useEditProfileMutation } from '@v6/api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { AuthenticatedRoute } from '~/components/guards/AuthenticatedRoute';
import { HeadMetaData } from '~/components/meta/HeadMetaData';
import {
  EditProfileFormInner,
  ProfileDisplaySection,
} from '~/features/profile/components';
import { EditProfileFormSchema } from '~/features/profile/forms/edit-profile';
import { queryClient } from '~/lib/react-query';

const ProfilePage = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const { mutateAsync: editProfileMutate } = useEditProfileMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profile'],
      });
    },
  });

  const handleEditProfileSubmit = async (
    values: EditProfileFormSchema & { profilePictureFile?: File },
  ) => {
    try {
      await editProfileMutate(values);
      setIsEditMode(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        const err = error as AxiosError<{ errors: string[] }>;

        toast.error(err.response?.data.errors[0]);
        return;
      }
    }
  };

  return (
    <AuthenticatedRoute>
      <HeadMetaData title="Profile" />
      <main className="container min-h-screen max-w-screen-md">
        {isEditMode ? (
          <>
            <EditProfileFormInner
              onCancel={() => setIsEditMode(false)}
              onSubmit={handleEditProfileSubmit}
            />
          </>
        ) : (
          <ProfileDisplaySection onEditProfile={() => setIsEditMode(true)} />
        )}
      </main>
    </AuthenticatedRoute>
  );
};

export default ProfilePage;
