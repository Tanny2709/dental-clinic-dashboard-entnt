
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
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Scheduled': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const AppointmentCard = ({ appointment, isPast = false }: { appointment: any, isPast?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className={`pb-4 rounded-t-lg ${isPast ? 'bg-gradient-to-r from-slate-500 to-slate-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 text-white rounded-full w-12 h-12 flex items-center justify-center">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">{appointment.title}</CardTitle>
              <CardDescription className="flex items-center gap-3 mt-2 text-white/80">
                <Calendar className="h-4 w-4" />
                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy')}
                <Clock className="h-4 w-4 ml-3" />
                {format(new Date(appointment.appointmentDate), 'HH:mm')}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-6">
        <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{appointment.description}</p>
        
        {appointment.comments && (
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-slate-700">
              <strong className="text-blue-700">Notes:</strong> {appointment.comments}
            </p>
          </div>
        )}
        
        {appointment.treatment && (
          <div className="flex items-center gap-3 text-slate-700 bg-teal-50 p-3 rounded-lg">
            <FileText className="h-5 w-5 text-teal-600" />
            <span><strong className="text-teal-700">Treatment:</strong> {appointment.treatment}</span>
          </div>
        )}
        
        {appointment.cost && (
          <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span><strong>Cost:</strong> ${appointment.cost}</span>
          </div>
        )}
        
        {appointment.nextDate && (
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <p className="text-purple-700">
              <strong>Next Visit:</strong> {format(new Date(appointment.nextDate), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
            </p>
          </div>
        )}
        
        {appointment.files && appointment.files.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <p className="font-semibold text-slate-700 mb-3">Attachments:</p>
            <div className="flex flex-wrap gap-2">
              {appointment.files.map((file: any, index: number) => (
                <Badge key={index} variant="outline" className="border-slate-300 text-slate-600 bg-slate-50">
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
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-slate-600 mt-2">View your dental appointments and treatment history</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-medium">Upcoming</CardTitle>
            <Calendar className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-medium">Completed</CardTitle>
            <FileText className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {myAppointments.filter(a => a.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-medium">Total Spent</CardTitle>
            <DollarSign className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${myAppointments
                .filter(a => a.status === 'Completed')
                .reduce((sum, a) => sum + (a.cost || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-800 bg-white p-4 rounded-lg shadow-sm">Upcoming Appointments</h2>
          <div className="space-y-6">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-800 bg-white p-4 rounded-lg shadow-sm">Past Appointments</h2>
          <div className="space-y-6">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {myAppointments.length === 0 && (
        <Card className="text-center py-16 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent>
            <Stethoscope className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 mb-3">No appointments found</h3>
            <p className="text-slate-500">You don't have any appointments scheduled or completed yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyAppointments;
