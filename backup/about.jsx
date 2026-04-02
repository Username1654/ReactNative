import { View, Text, StyleSheet, ScrollView } from 'react-native';

const STACK = [
  { name: 'React Native', desc: 'Cross-platform mobile UI framework', icon: '⚛️' },
  { name: 'Expo', desc: 'Build & deploy tools for React Native', icon: '🚀' },
  { name: 'Expo Router', desc: 'File-based navigation (like Next.js)', icon: '🗺️' },
  { name: 'SQLite', desc: 'Local relational database on the device', icon: '🗄️' },
  { name: 'JavaScript', desc: 'The language tying it all together', icon: '📜' },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>About This App</Text>
      <Text style={styles.body}>
        This project is a learning exercise exploring how to build native mobile
        applications using web-adjacent technologies. The same JavaScript skills
        you used in React transfer directly here.
      </Text>

      <Text style={styles.sectionTitle}>Tech Stack</Text>

      {STACK.map((item) => (
        <View key={item.name} style={styles.card}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          💡 Later we'll hook up a real SQLite database to persist your todos
          — stored directly on your phone.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4f46e5',
  },
  cardIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  note: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  noteText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
  },
});