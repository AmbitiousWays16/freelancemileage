import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Image, Upload, Trash2, Loader2 } from 'lucide-react';
import { Profile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface CompanyBrandingUploadProps {
  profile: Profile | null;
  onUpload: (file: File, type: 'logo' | 'banner') => Promise<string | null>;
  onRemove: (type: 'logo' | 'banner') => Promise<void>;
}

export const CompanyBrandingUpload = ({ profile, onUpload, onRemove }: CompanyBrandingUploadProps) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setUploading(type);
    await onUpload(file, type);
    setUploading(null);
    toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded!`);
  };

  const handleRemove = async (type: 'logo' | 'banner') => {
    await onRemove(type);
    toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} removed`);
  };

  const logoUrl = profile?.company_logo_url || '';
  const bannerUrl = profile?.company_banner_url || '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Image className="h-3.5 w-3.5" /> Branding
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Company Branding</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <p className="text-xs text-muted-foreground">Shown on invoice header. Recommended: square, under 5MB.</p>
            {logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-lg border object-contain bg-muted p-1" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove('logo')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full h-20 border-dashed" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}>
                {uploading === 'logo' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Logo
              </Button>
            )}
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
          </div>

          {/* Banner */}
          <div className="space-y-2">
            <Label>Invoice Banner</Label>
            <p className="text-xs text-muted-foreground">Wide header image for invoices. Recommended: 800×200px, under 5MB.</p>
            {bannerUrl ? (
              <div className="space-y-2">
                <img src={bannerUrl} alt="Banner" className="w-full h-24 rounded-lg border object-cover bg-muted" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => bannerRef.current?.click()}>
                    Replace
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove('banner')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full h-20 border-dashed" onClick={() => bannerRef.current?.click()} disabled={uploading === 'banner'}>
                {uploading === 'banner' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload Banner
              </Button>
            )}
            <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'banner')} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
