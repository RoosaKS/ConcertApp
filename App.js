import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AddConcerts from "./components/AddConcerts";
import Map from "./components/Map";
import Calendars from "./components/Calendar";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Concerts from "./components/ConcertList";
import Photos from "./components/Photos";
import EditConcerts from "./components/EditConcerts";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabScreen = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Concerts') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Calendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'AddConcerts') {
          iconName = focused ? 'add' : 'add-outline';
        } else if (route.name === 'Map') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Photos') {
          iconName = focused ? 'images' : 'images-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'blue',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Concerts" component={Concerts} />
    <Tab.Screen name="Calendar" component={Calendars} />
    <Tab.Screen name="AddConcerts" component={AddConcerts} options={{ title: 'Add Concerts' }} />
    <Tab.Screen name="Map" component={Map} />
    <Tab.Screen name="Photos" component={Photos} />
  </Tab.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen name="Main" component={MainTabScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Edit" component={EditConcerts} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}