// components/admin/tournament/TournamentForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, UploadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUploader } from '@/components/ui/image-uploader';
import { TeamSelector } from '@/components/admin/team/TeamSelector';
import { cn } from '@/lib/utils';

const tournamentFormats = [
  { label: 'Single Elimination', value: 'SINGLE_ELIMINATION' },
  { label: 'Double Elimination', value: 'DOUBLE_ELIMINATION' },
  { label: 'Round Robin', value: 'ROUND_ROBIN' },
  { label: 'Swiss System', value: 'SWISS' },
  { label: 'Custom', value: 'CUSTOM' },
];

export function TournamentForm({ tournament = null }) {
  const router = useRouter();
  const isEditing = !!tournament;
  
  const [selectedTeams, setSelectedTeams] = useState(tournament?.teams || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState(tournament?.bannerImage || null);
  
  const defaultValues = tournament 
    ? {
        ...tournament,
        startDate: new Date(tournament.startDate),
        endDate: new Date(tournament.endDate),
      }
    : {
        name: '',
        slug: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        prizePool: '',
        format: '',
        rules: '',
        status: 'UPCOMING',
      };
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = 
    useForm({ defaultValues });
  
  const watchName = watch('name');
  
  // Generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setValue('name', name);
    
    if (!isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setValue('slug', slug);
    }
  };
  
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const formData = new FormData();
      
      // Add tournament details
      Object.keys(data).forEach(key => {
        if (key === 'startDate' || key === 'endDate') {
          formData.append(key, data[key].toISOString());
        } else if (key !== 'bannerImage') {
          formData.append(key, data[key]);
        }
      });
      
      // Add teams
      formData.append('teams', JSON.stringify(selectedTeams.map(team => team.id)));
      
      // Add banner image if there's a new one
      if (bannerImage && bannerImage instanceof File) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Submit to API
      const url = isEditing 
        ? `/api/tournaments/${tournament.id}` 
        : '/api/tournaments';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save tournament');
      }
      
      const savedTournament = await response.json();
      
      toast.success(isEditing 
        ? 'Tournament updated successfully' 
        : 'Tournament created successfully'
      );
      
      // Redirect to tournament page after brief delay
      setTimeout(() => {
        router.push(`/admin/tournaments/${savedTournament.id}`);
        router.refresh();
      }, 500);
      
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tournament Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  onChange={handleNameChange}
                  placeholder="PUBG Global Championship 2025"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">Tournament name is required</p>
                )}
              </div>

              {/* Tournament Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">
                  URL Slug
                  {!isEditing && (
                    <span className="ml-1 text-gray-400 text-xs">(auto-generated)</span>
                  )}
                </Label>
                <Input
                  id="slug"
                  {...register('slug', { required: true })}
                  placeholder="pubg-global-championship-2025"
                  disabled={!isEditing}
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">URL slug is required</p>
                )}
              </div>
            </div>

            {/* Tournament Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the tournament"
                rows={3}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('startDate') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('startDate') ? (
                        format(watch('startDate'), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('startDate')}
                      onSelect={date => setValue('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watch('endDate') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('endDate') ? (
                        format(watch('endDate'), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('endDate')}
                      onSelect={date => setValue('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prize Pool */}
              <div className="space-y-2">
                <Label htmlFor="prizePool">Prize Pool</Label>
                <Input
                  id="prizePool"
                  {...register('prizePool')}
                  placeholder="$100,000"
                />
              </div>

              {/* Tournament Format */}
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select 
                  value={watch('format')} 
                  onValueChange={value => setValue('format', value)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select tournament format" />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentFormats.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={watch('status')} 
                onValueChange={value => setValue('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select tournament status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <ImageUploader
                initialImage={tournament?.bannerImage}
                onImageSelected={setBannerImage}
                aspectRatio={16/5}
                maxSizeMB={2}
              />
            </div>

            {/* Tournament Rules */}
            <div className="space-y-2">
              <Label htmlFor="rules">Rules</Label>
              <RichTextEditor
                value={watch('rules')}
                onChange={content => setValue('rules', content)}
                placeholder="Enter tournament rules and guidelines..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participating Teams */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Participating Teams</h3>
            <TeamSelector
              selectedTeams={selectedTeams}
              onChange={setSelectedTeams}
              maxTeams={32}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Controls */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Tournament'
          )}
        </Button>
      </div>
    </form>
  );
}