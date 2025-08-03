import React, { useState } from 'react';
import { Text, StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AppLayout from '../components/AppLayout';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { searchRecipes } from '../ApiRequestSender';
import Toast from 'react-native-toast-message';
type RootStackParamList = {
  Home: undefined;
  UploadFromWeb: undefined;
  Login: undefined;
  Register: undefined;
  Recipes: { recipes: { id: string; title: string; image: string }[] };
};

type Ingredient = {
  id?: string;
  amount: string;
  unit: string;
  name: string;
};

type Instruction = {
  id?: string;
  content: string;
  order: number;
};

type SubRecipe = {
  id?: string;
  name?: string;
  ingredients: Ingredient[];
};

type Recipe = {
  id: string;
  title: string;
  ingredients: Ingredient[];
  subRecipes: SubRecipe[];
  instructions: Instruction[];
};

export default function ShowRecipeScreen({ route }: any) {

  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { recipe } = route.params;


  const fetchRecipes = async () => {
    setLoading(true);
    try {
      // Calls the backend to get recommended recipes based on the current recipe's ID
      const recipes = await searchRecipes(recipe.id);

       // Navigates to the Recipes screen with the received recommendations
      navigation.navigate('Recipes', { recipes }); 

    } catch (err: any) {
      // Shows an error toast if the recommendation fetch fails
      Toast.show({
        type: 'error',
        text1: 'Recommendation Error',
        text2: String(err?.message ?? 'Unknown error'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Text style={styles.title}>🍽 Recipe View {recipe.title}</Text>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Main Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <IngredientList ingredients={recipe.ingredients} />
        {/* Sub-Recipes */}
        <Text style={styles.sectionTitle}>Sub-Recipes</Text>
        {recipe.subRecipes.length > 0 ? (
          recipe.subRecipes.map((sub :SubRecipe, idx : number) => (
            <SubRecipeBlock key={sub.id ?? idx} sub={sub} index={idx} />
          ))
        ) : (
          <Text style={styles.placeholder}>-</Text>
        )}
        {/* Instructions */}
        <Text style={styles.sectionTitle}>Instructions</Text>
        <InstructionsList instructions={recipe.instructions} />
      </ScrollView>

      {/* Button to trigger recipe recommendation fetch */}
      <TouchableOpacity style={styles.button} onPress={fetchRecipes}>
        <Text style={styles.buttonText}>Show Recipes</Text>
      </TouchableOpacity>

      {/* Loading Overlay shown while fetching recommendations */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      )}
    </AppLayout>
  );
}

// ----------------------
// Subcomponents
// ----------------------

function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  if (!ingredients?.length)
    return <Text style={styles.placeholder}>No ingredients available.</Text>;

  return (
    <>
      {ingredients.map((ing) => (
        // Fallback to name as key if no ID is provided
        <Text key={ing.id ?? ing.name} style={styles.text}>
          {ing.amount} {ing.unit} {ing.name}
        </Text>
      ))}
    </>
  );
}


function SubRecipeBlock({ sub, index }: { sub: SubRecipe; index: number }) {
  return (
    <View style={styles.subRecipe}>
      {/* Use given sub-recipe name or fallback to generic numbered label */}
      <Text style={styles.sectionTitle}>{sub.name || `Sub Recipe ${index + 1}`}</Text>
      <IngredientList ingredients={sub.ingredients} />
    </View>
  );
}


function InstructionsList({ instructions }: { instructions: Instruction[] }) {
  if (!instructions?.length)
    return <Text style={styles.placeholder}>No instructions provided.</Text>;

  return (
    <>
      {instructions
      // Ensure instructions are shown in the correct order
        .sort((a, b) => a.order - b.order)
        .map((inst, idx) => (
          <Text key={inst.id ?? idx} style={styles.text}>
            {idx + 1}. {inst.content}
          </Text>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  text: {
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subRecipe: {
    marginTop: 12,
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0F200D',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});