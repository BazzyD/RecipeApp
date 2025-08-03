import React from 'react';
import { Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import AppLayout from '../components/AppLayout';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { getRecipeById } from '../ApiRequestSender';
import Toast from 'react-native-toast-message';
type RootStackParamList = {
  Home: undefined;
  UploadFromWeb: undefined;
  Login: undefined;
  Register: undefined;
  ShowRecipe: { recipe: any };
};

// Single recipe card component (used in FlatList)
const RecipeCard = ({ title, image, onPress }: { title: string; image: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <Image source={{ uri: image }} style={styles.image} />
    <Text style={styles.title}>{title}</Text>
  </Pressable>
);

export default function RecipesScreen() {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  // List of recipe previews passed via navigation
const { recipes = [] } = route.params as { recipes?: { id: string; title: string; image: string }[] } || {};


  return (
    <AppLayout>
      <FlatList
        data={recipes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard
            title={item.title}
            image={item.image}
            onPress={async () => {
              try {
                // Fetch full recipe details before navigating
                const recipe = await getRecipeById(item.id);
                navigation.navigate('ShowRecipe', { recipe });
              } catch (err: any) {
                Toast.show({
                  type: 'error',
                  text1: 'Failed to load recipe',
                  text2: String(err?.message ?? 'Unknown error'),
                });
              }
            }}
          />
        )}
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
