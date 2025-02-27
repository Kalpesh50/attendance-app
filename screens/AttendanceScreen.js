import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';

const API_URL =  "https://bscverify.net"; // Make sure this matches your App.js

export default function AttendanceScreen({ route, navigation }) {
  const { 
    date: dateString, 
    selectedClass, 
    selectedSubject, 
    selectedTime,
    firstLectureAbsentees ,
    selectedBatch
  } = route.params;
  
  // Create date object with proper timezone handling
  const date = new Date(dateString);
  console.log("date",date);
  
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch students and initialize attendance
  const fetchStudents = async () => {
    try {
      console.log('Fetching students for class:', selectedClass);
      let url = `${API_URL}/api/attendance/students/${selectedClass}`;
  
      // If the selected subject is a lab, add the batch ID to the URL
      if (selectedBatch) {
        url += `?batch=${selectedBatch}`;
      }
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      console.log('Fetched students:', data);
      setStudents(data);
  
      // Initialize attendance state with student IDs
      const initialAttendance = {};
      data.forEach(student => {
        console.log('Processing student:', student.rollNo, 'First lecture absentees:', firstLectureAbsentees);
        // Check if student's roll number is in the firstLectureAbsentees array
        const isAbsentInFirstLecture = Array.isArray(firstLectureAbsentees) &&
          firstLectureAbsentees.includes(student.rollNo);
        console.log(`Student ${student.rollNo} absent in first lecture:`, isAbsentInFirstLecture);
        initialAttendance[student.id] = !isAbsentInFirstLecture; // true for present, false for absent
      });
  
      console.log('Initialized attendance state:', initialAttendance);
      setAttendance(initialAttendance);
  
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle attendance for a student
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const attendanceData = students.map(student => ({
        studentId: student.id,
        isPresent: attendance[student.id]
      }));

      const response = await fetch(`${API_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          time: selectedTime,
          className: selectedClass,
          subjectId: selectedSubject.id,
          attendanceData: attendanceData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit attendance');
      }

      alert('Attendance submitted successfully');
      navigation.navigate('Home');
      
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Add useEffect to fetch students when component mounts
  useEffect(() => {
    console.log('AttendanceScreen mounted with firstLectureAbsentees:', firstLectureAbsentees);
    fetchStudents();
  }, []); // Empty dependency array means this runs once when component mounts

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info Section */}
      <View style={styles.headerInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{date.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Class:</Text>
            <Text style={styles.infoValue}>{selectedClass}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Subject:</Text>
            <Text style={styles.infoValue}>{selectedSubject.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>{selectedTime}</Text>
          </View>
        </View>
      </View>

      {/* Students Grid */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.gridContainer}>
          {students.map(student => (
            <TouchableOpacity
              key={student.id}
              style={[
                styles.rollItem,
                !attendance[student.id] && styles.rollItemAbsent
              ]}
              onPress={() => toggleAttendance(student.id)}
            >
              <Text style={[
                styles.rollText,
                !attendance[student.id] && styles.rollTextAbsent
              ]}>
                {student.rollNo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          submitting && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Submitting...' : 'Submit Attendance'}
        </Text>
      </TouchableOpacity>

      {/* Loading Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={submitting}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Submitting Attendance...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  headerInfo: {
    backgroundColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-evenly',
  },
  rollItem: {
    width: 60,
    height: 60,
    margin: 8,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rollItemAbsent: {
    backgroundColor: '#ff5252',
    borderColor: '#ff5252',
  },
  rollText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  rollTextAbsent: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  }
});
