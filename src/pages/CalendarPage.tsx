
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
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingAppointments = useMemo(() => {
    return incidents
      .filter(incident => new Date(incident.appointmentDate) >= new Date())
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 10);
  }, [incidents]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">View and manage your appointment schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full"
              />
              
              {/* Mini appointment indicators */}
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Quick Overview</h4>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-gray-500 p-1">
                      {day}
                    </div>
                  ))}
                  {monthDays.map(day => {
                    const dayAppointments = getAppointmentsForDay(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className="text-center p-1 h-8 flex items-center justify-center relative cursor-pointer hover:bg-gray-50 rounded"
                        onClick={() => setSelectedDate(day)}
                      >
                        <span className={isSameDay(day, selectedDate) ? 'font-bold text-blue-600' : ''}>
                          {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM dd')}
              </CardTitle>
              <CardDescription>
                {appointmentsForDate.length} appointment{appointmentsForDate.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointmentsForDate.length > 0 ? (
                appointmentsForDate.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{appointment.title}</h4>
                        <Badge className={getStatusColor(appointment.status)} size="sm">
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.appointmentDate), 'HH:mm')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        {patient?.name}
                      </div>
                      <p className="text-xs text-gray-500">{appointment.description}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No appointments scheduled
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Next 10 scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  return (
                    <div key={appointment.id} className="p-2 border rounded space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">{appointment.title}</p>
                        <Badge variant="outline" size="sm">
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{patient?.name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(appointment.appointmentDate), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No upcoming appointments
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
