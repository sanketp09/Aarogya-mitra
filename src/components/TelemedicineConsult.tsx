import React, { useState, useEffect, useContext } from 'react';
import { Video, Calendar, Clock, User, Phone, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LanguageContext } from '../context/LanguageContext';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  avatar?: string;
}

interface Appointment {
  _id?: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const TelemedicineConsult = () => {
  const { toast } = useToast();
  const { translations, language } = useContext(LanguageContext);
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Geriatric Medicine',
      available: true,
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiology',
      available: false,
    },
    {
      id: '3',
      name: 'Dr. Emily Wilson',
      specialty: 'Neurology',
      available: true,
    },
    {
      id: '4',
      name: 'Dr. James Rodriguez',
      specialty: 'Primary Care',
      available: true,
    },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [inCall, setInCall] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments');
      if (!response.ok) {
        throw new Error('Server responded with an error');
      }
      const data = await response.json();
      setAppointments(data);
      console.log('Successfully loaded appointments:', data.length);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Don't show error toast to user as it's not critical
      // The UI will show "No upcoming appointments" which is fine
    }
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      toast({
        title: translations['telemedicine.missing.info'][language],
        description: translations['telemedicine.missing.info.desc'][language],
        variant: "destructive",
      });
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctor);
    
    try {
      // Create a new appointment object
      const newAppointment = {
        doctorId: selectedDoctor,
        doctorName: doctor?.name || '',
        date: appointmentDate,
        time: appointmentTime,
        status: 'scheduled' as const,
        // Add userId for MongoDB storage
        userId: "default-user"
      };
      
      // Send to server first before updating UI
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule appointment');
      }

      // Get the server response with proper MongoDB ID
      const savedAppointment = await response.json();
      
      // Use the server-saved appointment (with MongoDB _id) in the UI
      setAppointments(prev => [savedAppointment, ...prev]);

      toast({
        title: translations['telemedicine.appointment.scheduled'][language],
        description: `${translations['telemedicine.appointment.confirmed'][language]} ${doctor?.name} ${translations['telemedicine.appointment.on'][language]} ${appointmentDate} ${translations['telemedicine.appointment.at'][language]} ${appointmentTime} ${translations['telemedicine.appointment.confirmed.end'][language]}`,
      });

      // Reset form
      setSelectedDoctor(null);
      setAppointmentDate('');
      setAppointmentTime('');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: translations['telemedicine.error'][language],
        description: translations['telemedicine.error.desc'][language],
        variant: "destructive",
      });
    }
  };

  const handleJoinCall = (appointment: Appointment) => {
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    
    toast({
      title: translations['telemedicine.joining'][language],
      description: `${translations['telemedicine.connecting'][language]} ${doctor?.name}...`,
    });
    
    setInCall(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      // Delete from server first
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete appointment from server');
      }
      
      // Then update UI
      setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
      
      toast({
        title: translations['telemedicine.appointment.cancelled'][language],
        description: translations['telemedicine.appointment.cancelled.desc'][language],
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      // No need to show an error toast since the UI already shows it as deleted
      // and we don't want to confuse the user
      console.log('Failed to delete appointment from server:', error);
    }
  };

  const handleEndCall = () => {
    setInCall(false);
    
    toast({
      title: translations['telemedicine.call.ended'][language],
      description: translations['telemedicine.call.ended.desc'][language],
    });
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    
    toast({
      title: audioEnabled ? translations['telemedicine.mic.muted'][language] : translations['telemedicine.mic.unmuted'][language],
      description: audioEnabled ? translations['telemedicine.mic.muted.desc'][language] : translations['telemedicine.mic.unmuted.desc'][language],
    });
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    
    toast({
      title: videoEnabled ? translations['telemedicine.camera.off.title'][language] : translations['telemedicine.camera.on.title'][language],
      description: videoEnabled ? translations['telemedicine.camera.off.desc'][language] : translations['telemedicine.camera.on.desc'][language],
    });
  };

  const availableDates = [
    'April 15, 2023',
    'April 16, 2023',
    'April 17, 2023',
    'April 18, 2023',
    'April 19, 2023',
  ];

  const availableTimes = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
  ];

  if (inCall) {
    return (
      <div className="container mx-auto px-4 py-6 md:ml-64 animate-fade-in h-[80vh] flex flex-col">
        <div className="relative flex-grow bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4">
          {videoEnabled ? (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <Avatar className="h-32 w-32">
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-white">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-care-primary">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <VideoOff className="h-16 w-16 mb-4" />
              <p className="text-xl">{translations['telemedicine.camera.off'][language]}</p>
            </div>
          )}
          
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium animate-pulse">
            {translations['telemedicine.live'][language]}
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            size="lg" 
            className={`rounded-full ${!audioEnabled ? 'bg-red-100 text-red-500 border-red-300' : ''}`}
            onClick={toggleAudio}
          >
            {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className={`rounded-full ${!videoEnabled ? 'bg-red-100 text-red-500 border-red-300' : ''}`}
            onClick={toggleVideo}
          >
            {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
          
          <Button 
            variant="destructive" 
            size="lg" 
            className="rounded-full"
            onClick={handleEndCall}
          >
            <Phone className="h-6 w-6 rotate-225 transform" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:ml-64 animate-fade-in">
      <div className="flex items-center mb-6">
        <Video className="h-8 w-8 text-care-primary mr-3" />
        <h1 className="text-3xl font-bold">{translations['telemedicine.title'][language]}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{translations['telemedicine.schedule'][language]}</CardTitle>
              <CardDescription>
                {translations['telemedicine.book'][language]}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{translations['telemedicine.select.doctor'][language]}</label>
                <Select value={selectedDoctor || ''} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder={translations['telemedicine.choose.doctor'][language]} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem 
                        key={doctor.id} 
                        value={doctor.id}
                        disabled={!doctor.available}
                      >
                        {doctor.name} ({doctor.specialty})
                        {!doctor.available && translations['telemedicine.unavailable'][language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{translations['telemedicine.select.date'][language]}</label>
                <Select value={appointmentDate} onValueChange={setAppointmentDate}>
                  <SelectTrigger>
                    <SelectValue placeholder={translations['telemedicine.choose.date'][language]} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map(date => (
                      <SelectItem key={date} value={date}>
                        {date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{translations['telemedicine.select.time'][language]}</label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={translations['telemedicine.choose.time'][language]} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-care-primary hover:bg-care-secondary"
                onClick={handleScheduleAppointment}
              >
                {translations['telemedicine.schedule.appointment'][language]}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">{translations['telemedicine.your.appointments'][language]}</h2>
          
          {appointments.filter(a => a.status === 'scheduled').length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 pb-6 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>{translations['telemedicine.no.appointments'][language]}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments
                .filter(appointment => appointment.status === 'scheduled')
                .map(appointment => {
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  return (
                    <Card key={appointment._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                            <CardDescription>{doctor?.specialty}</CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            onClick={() => appointment._id && handleDeleteAppointment(appointment._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full bg-care-primary hover:bg-care-secondary"
                          onClick={() => handleJoinCall(appointment)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {translations['telemedicine.join.video'][language]}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          )}
          
          {appointments.filter(a => a.status === 'completed').length > 0 && (
            <>
              <h3 className="text-lg font-medium mt-6 mb-4">{translations['telemedicine.past.appointments'][language]}</h3>
              <div className="space-y-3">
                {appointments
                  .filter(a => a.status === 'completed')
                  .map(appointment => {
                    const doctor = doctors.find(d => d.id === appointment.doctorId);
                    return (
                      <Card key={appointment._id} className="bg-gray-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{doctor?.name}</CardTitle>
                          <CardDescription className="text-xs">{doctor?.specialty}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {appointment.date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.time}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            {translations['telemedicine.view.summary'][language]}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelemedicineConsult;