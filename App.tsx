import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper'; // Importing Button, Card, and TextInput from react-native-paper
import { FontAwesome } from '@expo/vector-icons'; // Importing FontAwesome icon from react-native-vector-icons
import Header from './components/Header';

export default function App() {
  const [teamCode, setTeamCode] = React.useState('');

  const handleLogin = () => {
    // Add your login logic here
    console.log('Logging in with team code:', teamCode);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
        <Header />
          <TextInput
            label="Team Code" // Label for the text input
            value={teamCode}
            onChangeText={setTeamCode}
            style={styles.input} // Custom styles for the text input
          />
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Inloggen
          </Button>
          <TouchableOpacity style={styles.footerLink}>
        <Text style={styles.footerText}>Hoe werkt deze app?</Text>
        <FontAwesome name="question-circle" size={20} color="black" />
      </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>
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
    width: '80%', // Adjust width as needed
    borderWidth: 1,
    borderColor: '#333', // Darker border color
    borderRadius: 10,
    padding: 10,
    marginBottom: 20, // Add bottom margin to create space for the footer link
  },
  input: {
    marginBottom: 50, // Add some bottom margin
    marginTop: 300
  },
  button: {
    marginTop: 10, // Add some top margin
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Add this line to center horizontally
    marginTop: 20
  },
  footerText: {
    marginRight: 20,
    marginLeft: 20
  },
});
