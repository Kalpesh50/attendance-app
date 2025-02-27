import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';

const API_URL ="https://bscverify.net";

export default function ReportScreen({ route }) {
  const { date: dateString, selectedClass } = route.params;
  const date = new Date(dateString);
  console.log("date on report",date);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({});
  const [noDataMessage, setNoDataMessage] = useState('');

  useEffect(() => {
    fetchAttendanceReport();
  }, []);

  const fetchAttendanceReport = async () => {
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = date.toISOString();
      
      console.log('Fetching report for:', {
        date: formattedDate,
        class: selectedClass
      });

      const response = await fetch(
        `${API_URL}/api/attendance/report?date=${formattedDate}&className=${selectedClass}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance report');
      }
      
      const data = await response.json();
      console.log('Received data:', data);

      if (data.message) {
        setNoDataMessage(data.message);
        setReportData({});
        return;
      }
      
      // Group attendance by time and subject
      const groupedData = data.reduce((acc, record) => {
        const timeKey = record.time;
        if (!acc[timeKey]) {
          acc[timeKey] = {};
        }
        
        const subjectKey = record.subject.name;
        if (!acc[timeKey][subjectKey]) {
          acc[timeKey][subjectKey] = [];
        }
        
        if (!record.isPresent) {
          acc[timeKey][subjectKey].push({
            rollNo: record.student.rollNo,
            name: record.student.name
          });
        }
        
        return acc;
      }, {});

      console.log('Grouped data:', groupedData);
      setReportData(groupedData);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load attendance report');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to format the report message
  const createReportMessage = () => {
    const dateStr = date.toLocaleDateString();
    let message = `*Attendance Report*\n`;
    message += `Date: ${dateStr}\n`;
    message += `Class: ${selectedClass}\n\n`;

    Object.entries(reportData).forEach(([time, subjects]) => {
      message += `*${time}*\n`;
      Object.entries(subjects).forEach(([subjectName, absentees]) => {
        message += `${subjectName}\n`;
        if (absentees.length > 0) {
          message += `Absent Roll Numbers: ${absentees
            .map(student => student.rollNo)
            .sort((a, b) => a - b)
            .join(', ')}\n`;
        } else {
          message += `No absent students\n`;
        }
        message += '\n';
      });
      message += '------------------------\n';
    });

    return message;
  };

  // Add this function to handle sharing
  const handleShare = async () => {
    try {
      const message = createReportMessage();
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        alert('WhatsApp is not installed on your device');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      alert('Failed to share report');
    }
  };

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
      {/* Header */}
      <View style={styles.header}>
       
        <Text style={styles.subHeaderText}>
          Date: {date.toLocaleDateString()}
        </Text>
        <Text style={styles.subHeaderText}>
          Class: {selectedClass}
        </Text>
      </View>

      {/* Updated Report Content */}
      <ScrollView style={styles.reportContainer}>
        {noDataMessage ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{noDataMessage}</Text>
          </View>
        ) : Object.keys(reportData).length === 0 ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No attendance records found for this date</Text>
          </View>
        ) : (
          Object.entries(reportData).map(([time, subjects]) => (
            <View key={time} style={styles.timeBlock}>
              <Text style={styles.timeText}>{time}</Text>
              
              {Object.entries(subjects).map(([subjectName, absentees]) => (
                <View key={subjectName} style={styles.subjectBlock}>
                  <Text style={styles.subjectText}>{subjectName}</Text>
                  
                  {absentees.length > 0 ? (
                    <View style={styles.absenteesList}>
                      <Text style={styles.absenteesHeader}>
                        Absent Students:
                      </Text>
                      <Text style={styles.absenteeText}>
                        {absentees
                          .map(student => student.rollNo)
                          .sort((a, b) => a - b)
                          .join(', ')}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noAbsenteesText}>
                      No absent students
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Share Button */}
      {!noDataMessage && Object.keys(reportData).length > 0 && (
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>Share on WhatsApp</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    elevation: 4,
  },

  subHeaderText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
  reportContainer: {
    flex: 1,
    padding: 10,
  },
  timeBlock: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subjectBlock: {
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
    paddingLeft: 10,
    marginBottom: 10,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  absenteesList: {
    marginLeft: 10,
  },
  absenteesHeader: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  absenteeText: {
    fontSize: 16,
    color: '#ff5252',
    marginLeft: 10,
    marginTop: 5,
  },
  noAbsenteesText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#25D366', // WhatsApp green color
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    marginBottom: 20, // Add some bottom margin
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 