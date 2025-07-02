
import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

const CalendarPage = () => {
  const { patients, incidents } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const appointmentsForDate = useMemo(() => {
    return incidents.filter(incident => 
      isSameDay(new Date(incident.appointmentDate), selectedDate)
    );
  }, [incidents, selectedDate]);

  const getAppointmentsForDay = (date: Date) => {
    return incidents.filter(incident => 
      isSameDay(new Date(incident.appointmentDate), date)
    );
  };

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Scheduled': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const upcomingAppointments = useMemo(() => {
    return incidents
      .filter(incident => new Date(incident.appointmentDate) >= new Date())
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 10);
  }, [incidents]);

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen p-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">Calendar</h1>
        <p className="text-slate-600 mt-2">View and manage your appointment schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CalendarIcon className="h-6 w-6" />
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
              />
              
              {/* Mini appointment indicators */}
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-slate-700">Quick Overview</h4>
                <div className="grid grid-cols-7 gap-2 text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-slate-500 p-2">
                      {day}
                    </div>
                  ))}
                  {monthDays.map(day => {
                    const dayAppointments = getAppointmentsForDay(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className="text-center p-2 h-10 flex items-center justify-center relative cursor-pointer hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => setSelectedDate(day)}
                      >
                        <span className={isSameDay(day, selectedDate) ? 'font-bold text-blue-600' : 'text-slate-600'}>
                          {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white text-xs flex items-center justify-center shadow-sm">
                            {dayAppointments.length}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Appointments */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-t-lg">
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM dd')}
              </CardTitle>
              <CardDescription className="text-white/80">
                {appointmentsForDate.length} appointment{appointmentsForDate.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {appointmentsForDate.length > 0 ? (
                appointmentsForDate.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-800">{appointment.title}</h4>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-4 w-4 text-blue-500" />
                        {format(new Date(appointment.appointmentDate), 'HH:mm')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-4 w-4 text-teal-500" />
                        {patient?.name}
                      </div>
                      <p className="text-sm text-slate-600 bg-white p-2 rounded">{appointment.description}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No appointments scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription className="text-white/80">Next 10 scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="p-3 border border-slate-200 rounded-lg space-y-2 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-slate-800">{appointment.title}</p>
                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{patient?.name}</p>
                      <p className="text-sm text-blue-600 font-medium">
                        {format(new Date(appointment.appointmentDate), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No upcoming appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
