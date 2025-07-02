
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Stethoscope,
  FileText,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { patients, incidents, getPatientIncidents } = useData();

  if (isAdmin) {
    // Admin Dashboard
    const totalPatients = patients.length;
    const totalIncidents = incidents.length;
    const completedIncidents = incidents.filter(i => i.status === 'Completed');
    const scheduledIncidents = incidents.filter(i => i.status === 'Scheduled');
    const inProgressIncidents = incidents.filter(i => i.status === 'In Progress');
    const totalRevenue = completedIncidents.reduce((sum, incident) => sum + (incident.cost || 0), 0);
    
    const upcomingAppointments = incidents
      .filter(i => i.status === 'Scheduled' && new Date(i.appointmentDate) >= new Date())
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 5);

    const todayAppointments = incidents
      .filter(i => {
        const appointmentDate = new Date(i.appointmentDate);
        const today = new Date();
        return appointmentDate.toDateString() === today.toDateString();
      });

    const topPatients = patients
      .map(patient => ({
        ...patient,
        incidentCount: incidents.filter(i => i.patientId === patient.id).length,
        totalSpent: incidents
          .filter(i => i.patientId === patient.id && i.status === 'Completed')
          .reduce((sum, i) => sum + (i.cost || 0), 0)
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Welcome back, Dr. Admin!</h1>
              <p className="text-blue-100">Here's what's happening in your practice today</p>
            </div>
          </div>
          
          {todayAppointments.length > 0 && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="font-medium">Today's Schedule</p>
              <p className="text-blue-100">{todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''} scheduled</p>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
              <Users className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalPatients}</div>
              <p className="text-sm text-gray-500 mt-1">Active patients in system</p>
              <div className="mt-2">
                <Link to="/patients">
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                    Manage patients <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Appointments</CardTitle>
              <Calendar className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalIncidents}</div>
              <p className="text-sm text-gray-500 mt-1">
                {scheduledIncidents.length} scheduled, {completedIncidents.length} completed
              </p>
              <div className="mt-2">
                <Link to="/appointments">
                  <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto">
                    View appointments <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
              <p className="text-sm text-gray-500 mt-1">From completed treatments</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-yellow-600">
                  {completedIncidents.length} treatments
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <Activity className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalIncidents > 0 ? Math.round((completedIncidents.length / totalIncidents) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Treatment completion rate</p>
              <div className="flex gap-1 mt-2">
                <Badge variant="outline" className="text-xs text-green-600">
                  {completedIncidents.length} completed
                </Badge>
                <Badge variant="outline" className="text-xs text-blue-600">
                  {inProgressIncidents.length} in progress
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Next Appointments
                  </CardTitle>
                  <CardDescription>Upcoming scheduled appointments</CardDescription>
                </div>
                <Link to="/appointments">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const patient = patients.find(p => p.id === appointment.patientId);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-150 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium">
                            {patient?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient?.name}</p>
                            <p className="text-sm text-gray-600">{appointment.title}</p>
                            <p className="text-xs text-blue-600 font-medium">
                              {format(new Date(appointment.appointmentDate), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">{appointment.status}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Patients */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Top Patients
                  </CardTitle>
                  <CardDescription>Patients by total spending</CardDescription>
                </div>
                <Link to="/patients">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPatients.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-150 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.incidentCount} appointments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${patient.totalSpent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } else {
    // Patient Dashboard
    const patientIncidents = getPatientIncidents(user?.patientId || '');
    const upcomingAppointments = patientIncidents
      .filter(i => i.status === 'Scheduled' && new Date(i.appointmentDate) >= new Date())
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
    
    const completedTreatments = patientIncidents.filter(i => i.status === 'Completed');
    const totalSpent = completedTreatments.reduce((sum, incident) => sum + (incident.cost || 0), 0);

    const nextAppointment = upcomingAppointments[0];

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-green-100">Your dental care dashboard</p>
            </div>
          </div>
          
          {nextAppointment && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="font-medium">Next Appointment</p>
              <p className="text-green-100">
                {nextAppointment.title} - {format(new Date(nextAppointment.appointmentDate), 'MMM dd, yyyy \'at\' HH:mm')}
              </p>
            </div>
          )}
        </div>

        {/* Patient KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{upcomingAppointments.length}</div>
              <p className="text-sm text-gray-500 mt-1">Scheduled appointments</p>
              <div className="mt-2">
                <Link to="/my-appointments">
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                    View appointments <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedTreatments.length}</div>
              <p className="text-sm text-gray-500 mt-1">Total treatments received</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-green-600">
                  All completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${totalSpent}</div>
              <p className="text-sm text-gray-500 mt-1">On dental treatments</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-medium">{appointment.title}</h3>
                        <p className="text-sm text-gray-600">{appointment.description}</p>
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{appointment.status}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming appointments</p>
                  </div>
                )}
              </div>
              {upcomingAppointments.length > 3 && (
                <div className="mt-4 text-center">
                  <Link to="/my-appointments">
                    <Button variant="outline" size="sm">
                      View All Appointments
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Treatments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Recent Treatments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTreatments.slice(0, 3).map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{treatment.title}</h3>
                      <p className="text-sm text-gray-600">{treatment.treatment}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(treatment.appointmentDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2 text-green-600">Completed</Badge>
                      {treatment.cost && (
                        <p className="text-sm font-medium">${treatment.cost}</p>
                      )}
                    </div>
                  </div>
                ))}
                {completedTreatments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No completed treatments yet</p>
                  </div>
                )}
              </div>
              {completedTreatments.length > 3 && (
                <div className="mt-4 text-center">
                  <Link to="/my-appointments">
                    <Button variant="outline" size="sm">
                      View Treatment History
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
};

export default Dashboard;
