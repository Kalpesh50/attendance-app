import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from 'date-fns';  // Import date-fns to format the date

import DatePicker from 'react-datepicker'; // Add this import for web compatibility
import 'react-datepicker/dist/react-datepicker.css'; // Add this CSS import for the date picker
import { Platform } from 'react-native-web';


const API_URL = "https://bscverify.net";

export default function HomeScreen() {
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [firstLectureAbsentees, setFirstLectureAbsentees] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const fetchSubjects = async (className) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/attendance/subjects/${className}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchFirstLectureAbsentees = async (date, className) => {
    try {
      const response = await fetch(`${API_URL}/api/attendance/first-lecture-absentees?date=${date}&className=${className}`);
      if (!response.ok) {
        throw new Error('Failed to fetch first lecture absentees');
      }
      const data = await response.json();
      console.log("absent data " + data)
      setFirstLectureAbsentees(data.absentees);
    } catch (error) {
      console.error('Error fetching first lecture absentees:', error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchFirstLectureAbsentees(selectedDate, selectedClass); // Fetch absentees when both date and class are selected
    }
  }, [selectedClass, selectedDate]); // This hook depends on both class and date


  const handleDateConfirm = (date) => {
    // Format the date using date-fns to get only the date part (YYYY-MM-DD)
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    setDatePickerVisibility(false);

    if (selectedClass) {
      fetchFirstLectureAbsentees(formattedDate, selectedClass);
    }
  };

  const handleNext = () => {
    if (!selectedDate || !selectedClass || !selectedSubject || !timeSlot) {
      alert('Please select all fields');
      return;
    }

    const selectedData = {
      date: selectedDate,
      selectedClass,
      selectedSubject,
      selectedTime: timeSlot,
      firstLectureAbsentees,
    };

    navigation.navigate('Attendance', selectedData);
  };

  const handleGetReport = () => {
    if (!selectedDate || !selectedClass) {
      alert('Please select both Date and Class');
      return;
    }

    // Pass date and selected class to the ReportScreen
    navigation.navigate('Report', { date: selectedDate, selectedClass });
  };

  const handleGetExcel = () =>{
    navigation.navigate('Excel')
  }


  return (
    <View style={styles.container}>
      {Platform ? (<Text style={styles.header}>Attendance App on web</Text>) : (<Text style={styles.header}>Attendance App</Text>)}
      

      <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
  
          <TextInput
            style={styles.input}
            value={selectedDate}
            placeholder="YYYY-MM-DD"
            editable={false}
          />
        </TouchableOpacity>
        
      

      <Text style={styles.label}>Select Class:</Text>
      <Picker
        selectedValue={selectedClass}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedClass(itemValue)}
      >
        <Picker.Item label="Select Class" value="" />
        <Picker.Item label="SY-A" value="SY-A" />
        <Picker.Item label="SY-B" value="SY-B" />
        <Picker.Item label="TY" value="TY" />
        <Picker.Item label="Btech" value="Btech" />
      </Picker>

      <Text style={styles.label}>Select Subject:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <Picker
          selectedValue={selectedSubject}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          enabled={subjects.length > 0}
        >
          {subjects.map((subject) => (
            <Picker.Item key={subject.id} label={`${subject.name} (${subject.type})`} value={subject} />
          ))}
        </Picker>
      )}

      <Text style={styles.label}>Select Time Slot:</Text>
      <Picker
        selectedValue={timeSlot}
        style={styles.picker}
        onValueChange={(itemValue) => setTimeSlot(itemValue)}
      >
        <Picker.Item label="10:00 AM - 11:00 AM" value="10:00 AM - 11:00 AM" />
        <Picker.Item label="11:00 AM - 12:00 PM" value="11:00 AM - 12:00 PM" />
        <Picker.Item label="12:00 PM - 01:00 PM" value="12:00 PM - 01:00 PM" />
        <Picker.Item label="01:00 PM - 02:00 PM" value="01:00 PM - 02:00 PM" />
        <Picker.Item label="02:00 PM - 03:00 PM" value="02:00 PM - 03:00 PM" />
        <Picker.Item label="03:00 PM - 04:00 PM" value="03:00 PM - 04:00 PM" />
        <Picker.Item label="04:00 PM - 05:00 PM" value="04:00 PM - 05:00 PM" />
      </Picker>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      {selectedDate && selectedClass && (
        <TouchableOpacity style={styles.button1} onPress={handleGetReport}>
          <Text style={styles.buttonText1}>Get Report</Text>
        </TouchableOpacity>
      )}

<TouchableOpacity style={styles.button} onPress={handleGetExcel}>
          <Text style={styles.buttonText}>Get Excel</Text>
        </TouchableOpacity>



      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 20,
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    marginTop: 15,
    
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },


  button1: {
    backgroundColor: '#2196F3',
    padding: 15,
    marginTop: 15,
    backgroundColor:"orange",
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText1: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});
