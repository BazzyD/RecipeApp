import React from 'react';
import { Text, StyleSheet, View, ScrollView } from 'react-native';
import AppLayout from '../components/AppLayout';

export default function ShowRecipeScreen({ route }: any) {
  const { recipe } = route.params;
  const { ingredients, subRecipes, instructions } = recipe;

  return (
    <AppLayout>
      <Text style={styles.title}>🍽 Recipe View {recipe.title}</Text>
      <ScrollView contentContainerStyle={styles.container}>

  {/* Main Ingredients */}
  {Array.isArray(ingredients) && ingredients.length > 0 ? (
    <>
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.map((ing: any, idx: number) => (
        <Text key={idx} style={styles.text}>
            {ing.amount} {ing.unit} {ing.name}
        </Text>
      ))}
    </>
  ) : (
    <Text style={styles.placeholder}>No ingredients available.</Text>
  )}

  {/* Sub-Recipes */}
  {Array.isArray(subRecipes) && subRecipes.length > 0 ? (
    subRecipes.map((sub: any, sIdx: number) => (
      <View key={sIdx} style={styles.subRecipe}>
        <Text style={styles.sectionTitle}>
          {sub.name || `Sub Recipe ${sIdx + 1}`}
        </Text>

        {Array.isArray(sub.ingredients) && sub.ingredients.length > 0 ? (
          sub.ingredients.map((ing: any, idx: number) => (
            <Text key={idx} style={styles.text}>
              - {ing.amount} {ing.unit} {ing.name}
            </Text>
          ))
        ) : (
          <Text style={styles.placeholder}>No ingredients in this sub-recipe.</Text>
        )}
      </View>
    ))
  ) : (
    <Text style={styles.placeholder}>No sub-recipes available.</Text>
  )}
{/* Instructions */}
{Array.isArray(instructions) && instructions.length > 0 ? (
  <>
    <Text style={styles.sectionTitle}>Instructions</Text>
    {recipe.instructions
      .sort((a: any, b: any) => a.order - b.order)
      .map((instruction: any, idx: number) => (
        <Text key={idx} style={styles.text}>
          {idx + 1}. {instruction.content}
        </Text>
      ))}
  </>
) : (
  <Text style={styles.placeholder}>No instructions provided.</Text>
)}
</ScrollView>

    </AppLayout>
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

});
