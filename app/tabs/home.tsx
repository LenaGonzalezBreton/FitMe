import { View, Text, ScrollView } from "react-native";
import ExerciseCard from "@/components/ExerciseCard";

export default function Home() {
    const exercises = [
        {
            name: "Shoulder Press Machine",
            details: "4x12 – poids conseillé : 2kg",
        },
        {
            name: "Incline Dumbbell Press",
            details: "4x10 – poids conseillé : 6kg",
        },
        // ...
    ];

    return (
        <View className="flex-1 bg-charcoal px-lg pt-xl">
            <Text className="text-cream text-xl font-bold mb-lg">
                Bonjour Léna ✨
            </Text>
            <Text className="text-cream mb-lg">
                Séance du jour : Push – Hypertrophie – {exercises.length} exos – ~45min
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {exercises.map((exo, i) => (
                    <ExerciseCard key={i} {...exo} />
                ))}
            </ScrollView>
        </View>
    );
}
