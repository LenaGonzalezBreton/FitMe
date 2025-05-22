import { Tabs } from 'expo-router';

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{ title: "Accueil" }} />
            <Tabs.Screen name="program" options={{ title: "Programme" }} />
            <Tabs.Screen name="progress" options={{ title: "Progression" }} />
            <Tabs.Screen name="timer" options={{ title: "Chrono" }} />
        </Tabs>
    );
}
