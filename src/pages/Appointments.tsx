
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, Clock, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';

const Appointments = () => {
  const { patients, incidents, addIncident, updateIncident, deleteIncident } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    title: '',
    description: '',
    comments: '',
    appointmentDate: '',
    cost: '',
    treatment: '',
    status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled',
    nextDate: ''
  });

  const resetForm = () => {
    setFormData({
      patientId: '',
      title: '',
      description: '',
      comments: '',
      appointmentDate: '',
      cost: '',
      treatment: '',
      status: 'Scheduled',
      nextDate: ''
    });
    setEditingIncident(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incidentData = {
      ...formData,
      cost: formData.cost ? Number(formData.cost) : undefined,
      files: []
    };
    
    if (editingIncident) {
      updateIncident(editingIncident, incidentData);
    } else {
      addIncident(incidentData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (incident: any) => {
    setFormData({
      patientId: incident.patientId,
      title: incident.title,
      description: incident.description,
      comments: incident.comments,
      appointmentDate: incident.appointmentDate.slice(0, 16),
      cost: incident.cost?.toString() || '',
      treatment: incident.treatment || '',
      status: incident.status,
      nextDate: incident.nextDate ? incident.nextDate.slice(0, 16) : ''
    });
    setEditingIncident(incident.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      deleteIncident(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedIncidents = [...incidents].sort((a, b) => 
    new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage patient appointments and treatments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingIncident ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
                <DialogDescription>
                  {editingIncident ? 'Update appointment details.' : 'Schedule a new appointment for a patient.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patientId" className="text-right">Patient</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData({...formData, patientId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., Routine Cleaning"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="appointmentDate" className="text-right">Date & Time</Label>
                  <Input
                    id="appointmentDate"
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="comments" className="text-right">Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="treatment" className="text-right">Treatment</Label>
                  <Input
                    id="treatment"
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., Root canal therapy"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nextDate" className="text-right">Next Visit</Label>
                  <Input
                    id="nextDate"
                    type="datetime-local"
                    value={formData.nextDate}
                    onChange={(e) => setFormData({...formData, nextDate: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIncident ? 'Update Appointment' : 'Create Appointment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedIncidents.map((incident) => {
          const patient = patients.find(p => p.id === incident.patientId);
          return (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {patient?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(incident.appointmentDate), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(incident)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(incident.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{incident.description}</p>
                
                {incident.comments && (
                  <p className="text-sm text-gray-500 italic">Comments: {incident.comments}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {incident.treatment && (
                    <span className="text-gray-600">
                      <strong>Treatment:</strong> {incident.treatment}
                    </span>
                  )}
                  {incident.cost && (
                    <span className="flex items-center gap-1 text-green-600">
                      <DollarSign className="h-3 w-3" />
                      {incident.cost}
                    </span>
                  )}
                </div>
                
                {incident.nextDate && (
                  <p className="text-sm text-blue-600">
                    Next visit: {format(new Date(incident.nextDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {incidents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
            <p className="text-gray-600 mb-4">Start by scheduling your first appointment.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Appointments;
