
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
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm mb-8">
      <CardHeader className={`pb-6 rounded-t-lg ${isPast ? 'bg-gradient-to-r from-slate-500 to-slate-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 text-white rounded-full w-16 h-16 flex items-center justify-center">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white mb-2">{appointment.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-3 text-white/90 text-base">
                <Calendar className="h-5 w-5" />
                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy')}
                <Clock className="h-5 w-5 ml-4" />
                {format(new Date(appointment.appointmentDate), 'HH:mm')}
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} px-4 py-2 text-sm font-medium`}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 p-8">
        <p className="text-slate-700 bg-slate-50 p-4 rounded-lg text-base leading-relaxed">{appointment.description}</p>
        
        {appointment.comments && (
          <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-slate-700 text-base">
              <strong className="text-blue-700">Notes:</strong> {appointment.comments}
            </p>
          </div>
        )}
        
        {appointment.treatment && (
          <div className="flex items-center gap-4 text-slate-700 bg-teal-50 p-4 rounded-lg">
            <FileText className="h-6 w-6 text-teal-600" />
            <span className="text-base"><strong className="text-teal-700">Treatment:</strong> {appointment.treatment}</span>
          </div>
        )}
        
        {appointment.cost && (
          <div className="flex items-center gap-4 text-emerald-700 bg-emerald-50 p-4 rounded-lg">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <span className="text-base"><strong>Cost:</strong> ${appointment.cost}</span>
          </div>
        )}
        
        {appointment.nextDate && (
          <div className="p-6 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <p className="text-purple-700 text-base">
              <strong>Next Visit:</strong> {format(new Date(appointment.nextDate), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
            </p>
          </div>
        )}
        
        {appointment.files && appointment.files.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
            <p className="font-semibold text-slate-700 mb-4 text-base">Attachments:</p>
            <div className="flex flex-wrap gap-3">
              {appointment.files.map((file: any, index: number) => (
                <Badge key={index} variant="outline" className="border-slate-300 text-slate-600 bg-slate-50 px-3 py-1">
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
    <div className="space-y-12">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <h1 className="text-4xl font-bold text-slate-800 mb-3">My Appointments</h1>
        <p className="text-slate-600 text-lg">View your dental appointments and treatment history</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-medium">Upcoming</CardTitle>
            <Calendar className="h-8 w-8 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{upcomingAppointments.length}</div>
            <p className="text-blue-100">Scheduled appointments</p>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-medium">Completed</CardTitle>
            <FileText className="h-8 w-8 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              {myAppointments.filter(a => a.status === 'Completed').length}
            </div>
            <p className="text-emerald-100">Total treatments</p>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-medium">Total Spent</CardTitle>
            <DollarSign className="h-8 w-8 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              ${myAppointments
                .filter(a => a.status === 'Completed')
                .reduce((sum, a) => sum + (a.cost || 0), 0)}
            </div>
            <p className="text-purple-100">On treatments</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-slate-800 bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
            Upcoming Appointments
          </h2>
          <div className="space-y-8">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold text-slate-800 bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg">
            Past Appointments
          </h2>
          <div className="space-y-8">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {myAppointments.length === 0 && (
        <Card className="text-center py-20 shadow-xl border-0 bg-white/90 backdrop-blur-md">
          <CardContent>
            <Stethoscope className="h-20 w-20 text-slate-300 mx-auto mb-8" />
            <h3 className="text-2xl font-semibold text-slate-700 mb-4">No appointments found</h3>
            <p className="text-slate-500 text-lg">You don't have any appointments scheduled or completed yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyAppointments;
