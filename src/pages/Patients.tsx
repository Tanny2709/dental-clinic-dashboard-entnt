
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, User, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';

const Patients = () => {
  const { patients, incidents, addPatient, updatePatient, deletePatient } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    contact: '',
    email: '',
    address: '',
    healthInfo: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dob: '',
      contact: '',
      email: '',
      address: '',
      healthInfo: ''
    });
    setEditingPatient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      updatePatient(editingPatient, formData);
    } else {
      addPatient(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (patient: any) => {
    setFormData({
      name: patient.name,
      dob: patient.dob,
      contact: patient.contact,
      email: patient.email || '',
      address: patient.address || '',
      healthInfo: patient.healthInfo
    });
    setEditingPatient(patient.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this patient? This will also delete all their appointments.')) {
      deletePatient(id);
    }
  };

  const getPatientStats = (patientId: string) => {
    const patientIncidents = incidents.filter(i => i.patientId === patientId);
    const completed = patientIncidents.filter(i => i.status === 'Completed').length;
    const scheduled = patientIncidents.filter(i => i.status === 'Scheduled').length;
    const totalSpent = patientIncidents
      .filter(i => i.status === 'Completed')
      .reduce((sum, i) => sum + (i.cost || 0), 0);
    
    return { total: patientIncidents.length, completed, scheduled, totalSpent };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Manage your patients and their information</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                <DialogDescription>
                  {editingPatient ? 'Update patient information.' : 'Add a new patient to your practice.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact" className="text-right">Phone</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="healthInfo" className="text-right">Health Info</Label>
                  <Textarea
                    id="healthInfo"
                    value={formData.healthInfo}
                    onChange={(e) => setFormData({...formData, healthInfo: e.target.value})}
                    className="col-span-3"
                    placeholder="Allergies, medical conditions, etc."
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPatient ? 'Update Patient' : 'Add Patient'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => {
          const stats = getPatientStats(patient.id);
          return (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(patient.dob), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {patient.contact}
                </div>
                
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  {patient.healthInfo}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {stats.total} appointments
                  </Badge>
                  <Badge variant="outline" className="text-xs text-green-600">
                    {stats.completed} completed
                  </Badge>
                  <Badge variant="outline" className="text-xs text-blue-600">
                    {stats.scheduled} scheduled
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-900">
                    Total Spent: <span className="text-green-600">${stats.totalSpent}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {patients.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first patient to the system.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Patient
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Patients;
