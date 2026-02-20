import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Upload, MapPin, Sparkles, Loader2, CheckCircle2, Camera, Navigation, Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import LocationPicker from "@/components/LocationPicker";
import { submitNewReport, transcribeAudio } from "@/lib/api";
import { useRef } from "react";

const Report = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleListen = async () => {
    if (isListening) {
      stopRecording();
      return;
    }

    startRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak now to record your description. Click again to stop.",
        });
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Stop all tracks to release light/microphone
        stream.getTracks().forEach(track => track.stop());

        await handleTranscription(audioBlob);
      };

      mediaRecorder.start();

    } catch (err) {
      console.error("Microphone access error:", err);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone permissions to use voice reporting.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    toast({
      title: "Transcribing...",
      description: "AI is analyzing your voice.",
    });

    try {
      const response = await transcribeAudio(audioBlob);
      if (response.text) {
        setDescription((prev) => prev ? `${prev} ${response.text}` : response.text);
        toast({
          title: "Transcription Success",
          description: "Text added to description.",
        });
      }
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: (error as Error).message || "Could not transcribe audio.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Simulate AI scanning
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    setLocationActive(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setTimeout(() => setLocationActive(false), 1000);
          toast({
            title: "Location captured!",
            description: "Your current location has been set",
          });
        },
        (error) => {
          setLocationActive(false);
          toast({
            title: "Location error",
            description: "Could not get your location. Please select on map.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || latitude === null || longitude === null) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fileList = {
        0: imageFile,
        length: 1,
        item: (index: number) => index === 0 ? imageFile : null,
        [Symbol.iterator]: function* () {
          yield imageFile;
        }
      } as FileList;

      await submitNewReport({
        description,
        latitude,
        longitude,
        file: fileList
      });

      toast({
        title: "Report Submitted! 🎉",
        description: "Thank you for helping improve your community",
      });

      navigate('/my-reports');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not submit report",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Report an Issue
            </h1>
            <p className="text-gray-600 flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI-Powered Civic Assistant</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Image Upload Zone */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/50 rounded-2xl shadow-xl overflow-hidden">
              <CardContent className="p-8">
                <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                  Upload Evidence
                </Label>

                {!imagePreview ? (
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 relative group">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Camera className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            Drop image here or click to upload
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            JPG, PNG or WebP (Max 5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />

                    {/* Scanning overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                            <Sparkles className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-2" />
                          </div>
                          <p className="font-semibold text-lg">Scanning image...</p>
                          <p className="text-sm text-white/80 mt-1">AI analyzing the issue</p>
                        </div>
                      </div>
                    )}

                    {/* Change image button */}
                    <div className="absolute top-4 right-4">
                      <label htmlFor="image-upload-change" className="cursor-pointer">
                        <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all">
                          <Upload className="w-4 h-4 inline mr-2" />
                          <span className="text-sm font-medium">Change</span>
                        </div>
                        <input
                          id="image-upload-change"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/50 rounded-2xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold text-gray-800">
                    Describe the Issue
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleListen}
                    disabled={isTranscribing}
                    className={`flex items-center space-x-2 transition-all ${isListening
                      ? 'border-red-500 text-red-500 bg-red-50 animate-pulse'
                      : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                      }`}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transcribing...</span>
                      </>
                    ) : isListening ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Voice Type</span>
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue..."
                  className="min-h-[120px] resize-none border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  {description.length}/500 characters (minimum 10)
                </p>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="backdrop-blur-xl bg-white/80 border-white/50 rounded-2xl shadow-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold text-gray-800">
                    Issue Location
                  </Label>
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    className={`${locationActive
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      } transition-all duration-300 ${locationActive ? 'animate-pulse' : ''}`}
                    disabled={locationActive}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {locationActive ? 'Getting Location...' : 'Get Live Location'}
                  </Button>
                </div>

                {latitude && longitude && (
                  <div className="mb-4 p-4 bg-indigo-50 rounded-lg flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </span>
                  </div>
                )}

                <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={latitude && longitude ? [latitude, longitude] : undefined}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting || !description || !imageFile || latitude === null}
                className="w-full md:w-auto px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Report with AI Analysis
                  </>
                )}
              </Button>
            </div>

            {/* Info Card */}
            <Card className="backdrop-blur-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Powered by AWS AI
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your report will be automatically analyzed using Amazon Bedrock, categorized,
                      and routed to the appropriate department for faster resolution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default Report;
