import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const API_URL =  "https://bscverify.net";

const GetExcelScreen = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Fetch subjects when class is selected
  const fetchSubjects = async (className) => {
    try {
      const response = await fetch(`${API_URL}/api/attendance/subjects/${className}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      alert('Failed to fetch subjects: ' + error.message);
    }
  };

  // Handle class selection
  const handleClassChange = (itemValue) => {
    setSelectedClass(itemValue);
    setSelectedSubject(''); // Reset selected subject
    if (itemValue) {
      fetchSubjects(itemValue);
    }
  };

  // Validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle export to Excel
  const handleExportExcel = async () => {
    if (!selectedClass || !selectedSubject) {
      alert('Please select both class and subject');
      return;
    }

    if (!email || !isValidEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/attendance/export-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className: selectedClass,
          subjectId: selectedSubject.id,
          email: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export Excel');
      }

      alert('Excel file has been sent to your email!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to send Excel: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Class Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Class</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClass}
            onValueChange={handleClassChange}
            style={styles.picker}
          >
            <Picker.Item label="Select a class" value="" />
            <Picker.Item label="SY-A" value="SY-A" />
            <Picker.Item label="SY-B" value="SY-B" />
            <Picker.Item label="TY" value="TY" />
            <Picker.Item label="BTech" value="BTech" />
          </Picker>
        </View>
      </View>

      {/* Subject Selector */}
      {selectedClass && (
        <View style={styles.section}>
          <Text style={styles.label}>Select Subject</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select a subject" value="" />
              {subjects.map((subject) => (
                <Picker.Item 
                  key={subject.id.toString()} 
                  label={`${subject.name} (${subject.type})`} 
                  value={subject}
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

      {/* Email Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Export Button */}
      <TouchableOpacity 
        style={[
          styles.exportButton,
          loading && styles.disabledButton,
          (!selectedClass || !selectedSubject || !isValidEmail(email)) && styles.disabledButton
        ]}
        onPress={handleExportExcel}
        disabled={loading || !selectedClass || !selectedSubject || !isValidEmail(email)}
      >
        <Text style={styles.exportButtonText}>
          {loading ? 'Sending...' : 'Send Excel Report'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
  },
  exportButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GetExcelScreen;