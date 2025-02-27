import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Import NavigationContainer
import { createStackNavigator } from '@react-navigation/stack'; // Import Stack Navigator
import HomeScreen from './screens/HomeScreen'; // Your HomeScreen component
import AttendanceScreen from './screens/AttendanceScreen'; // Your AttendanceScreen component
import ReportScreen from './screens/ReportScreen';
import GetExcelScreen from './screens/GetExcelScreen';

// Create a Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    // Wrap everything in NavigationContainer
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Add HomeScreen and AttendanceScreen to the stack */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="Report" component={ReportScreen}/>
        <Stack.Screen name='Excel' component={GetExcelScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
