import React , { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SideMenu from './SideMenu';
type AppLayoutProps = {
  children: React.ReactNode;
};


export default function AppLayout({ children }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
  <Text style={styles.menu}>☰</Text>
</TouchableOpacity>
        <View style={styles.logoContainer}>
          {/* Replace with your logo image if needed */}
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.title}>From List to Recipe</Text>
        </View>
      </View>

      {/* Content area */}
      <View style={styles.content}>{children}</View>
{menuOpen && <SideMenu onClose={() => setMenuOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F05501', // 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#a21000',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menu: {
    fontSize: 24,
    marginRight: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
