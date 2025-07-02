
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, FileText, User, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';

const MyAppointments = () => {
  const { user } = useAuth();
  const { getPatientIncidents } = useData();

  const myAppointments = getPatientIncidents(user?.patientId || '');
  
  const upcomingAppointments = myAppointments
    .filter(appointment => new Date(appointment.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
  const pastAppointments = myAppointments
    .filter(appointment => new Date(appointment.appointmentDate) < new Date())
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: any, isPast?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{appointment.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy')}
                <Clock className="h-3 w-3 ml-2" />
                {format(new Date(appointment.appointmentDate), 'HH:mm')}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">{appointment.description}</p>
        
        {appointment.comments && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Notes:</strong> {appointment.comments}
            </p>
          </div>
        )}
        
        {appointment.treatment && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-500" />
            <span><strong>Treatment:</strong> {appointment.treatment}</span>
          </div>
        )}
        
        {appointment.cost && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <DollarSign className="h-4 w-4" />
            <span><strong>Cost:</strong> ${appointment.cost}</span>
          </div>
        )}
        
        {appointment.nextDate && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Next Visit:</strong> {format(new Date(appointment.nextDate), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
            </p>
          </div>
        )}
        
        {appointment.files && appointment.files.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {appointment.files.map((file: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {file.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">View your dental appointments and treatment history</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {myAppointments.filter(a => a.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${myAppointments
                .filter(a => a.status === 'Completed')
                .reduce((sum, a) => sum + (a.cost || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Upcoming Appointments</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Past Appointments</h2>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {myAppointments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">You don't have any appointments scheduled or completed yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyAppointments;
