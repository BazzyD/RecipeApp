import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import AppLayout from '../components/AppLayout';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
type RootStackParamList = {
  Home: undefined;
  UploadFromWeb: undefined;
  Login: undefined;
  Register: undefined;
  ShowRecipe: { recipe: any };
};

const RecipeCard = ({ title, image }: { title: string; image: string }) => (
  <View style={styles.card}>
    <Image source={{ uri: image }} style={styles.image} />
    <Text style={styles.title}>{title}</Text>
  </View>
);
export default function RecipesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const route = useRoute();
  const { recipes } = route.params as { recipes: { id: number, title: string, image: string }[] };

   return (
    <AppLayout>
    <FlatList
      data={recipes}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => <RecipeCard title={item.title} image={item.image} />}
      contentContainerStyle={styles.list}
    />
    </AppLayout>

  );
}

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
});
