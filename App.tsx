import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Header from './components/Header';
import HikePage from './pages/HikePage';
import InfoPage from './pages/InfoPage';

type RootStackParamList = {
  Login: undefined;
  Hike: undefined;
  Info: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
};

const Stack = createStackNavigator<RootStackParamList>();

function LoginScreen({ navigation }: Props) {
  const [teamCode, setTeamCode] = useState('');

  const handleLogin = () => {
    console.log('Logging in with team code:', teamCode);
    if (teamCode === 'expectedCode') {
      navigation.navigate('Hike');
    } else {
      console.error('Login failed: Invalid team code');
      alert('Login failed: Invalid team code');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Header />
          <TextInput
            label="Team Code"
            value={teamCode}
            onChangeText={setTeamCode}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleLogin}>
            Inloggen
          </Button>
          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('Info')}>
            <Text style={styles.footerText}>Hoe werkt deze app?</Text>
            <FontAwesome name="question-circle" size={20} color="black" />
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Hike" component={HikePage} />
        <Stack.Screen name="Info" component={InfoPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bcebdf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 30, 
    marginTop: 100,  
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    marginRight: 10,
    marginLeft: 10,
  },
});
