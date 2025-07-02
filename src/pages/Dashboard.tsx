
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { patients, incidents, getPatientIncidents } = useData();

  if (isAdmin) {
    // Admin Dashboard
    const totalPatients = patients.length;
    const totalIncidents = incidents.length;
    const completedIncidents = incidents.filter(i => i.status === 'Completed');
    const scheduledIncidents = incidents.filter(i => i.status === 'Scheduled');
    const totalRevenue = completedIncidents.reduce((sum, incident) => sum + (incident.cost || 0), 0);
    
    const upcomingAppointments = incidents
      .filter(i => i.status === 'Scheduled' && new Date(i.appointmentDate) >= new Date())
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, 10);

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, Dr. Admin</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                Active patients in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncidents}</div>
              <p className="text-xs text-muted-foreground">
                {scheduledIncidents.length} scheduled, {completedIncidents.length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                From completed treatments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalIncidents > 0 ? Math.round((completedIncidents.length / totalIncidents) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Treatment completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Next 10 Appointments
              </CardTitle>
              <CardDescription>
                Upcoming scheduled appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const patient = patients.find(p => p.id === appointment.patientId);
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{patient?.name}</p>
                          <p className="text-sm text-gray-600">{appointment.title}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Patients
              </CardTitle>
              <CardDescription>
                Patients by total spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPatients.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.incidentCount} appointments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${patient.totalSpent}</p>
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

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Your dental care summary</p>
        </div>

        {/* Patient KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled appointments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Treatments</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTreatments.length}</div>
              <p className="text-xs text-muted-foreground">
                Total treatments received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent}</div>
              <p className="text-xs text-muted-foreground">
                On dental treatments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{appointment.title}</h3>
                      <p className="text-sm text-gray-600">{appointment.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
                      </p>
                    </div>
                    <Badge>{appointment.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Treatments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTreatments.slice(0, 5).map((treatment) => (
                <div key={treatment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{treatment.title}</h3>
                    <p className="text-sm text-gray-600">{treatment.treatment}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(treatment.appointmentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">Completed</Badge>
                    {treatment.cost && (
                      <p className="text-sm font-medium">${treatment.cost}</p>
                    )}
                  </div>
                </div>
              ))}
              {completedTreatments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No completed treatments yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default Dashboard;
