'use client';

import { getImageApiPath } from '@/utils/path';
import { Box, Button, VisuallyHidden } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

interface Props {
  name: string;
  onSelect: (file: File) => Promise<string>;
}

export default function ImageSelector({ name, onSelect }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const t = useTranslations('ImageSelector');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const imageFilename = await onSelect(file);
      setImagePath(getImageApiPath(imageFilename));
      setIsUploading(false);
    }
  };
  return (
    <>
      {imagePath && <img src={imagePath} alt="Selected" style={{ maxWidth: '200px' }} />}
      <input type="hidden" name={name} value={imagePath ?? ''} />
      <Box>
        <Button disabled={isUploading} type="button" onClick={() => fileInputRef.current?.click()}>
          {t('selectImage')}
        </Button>
      </Box>
      <VisuallyHidden>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
      </VisuallyHidden>
    </>
  );
}
