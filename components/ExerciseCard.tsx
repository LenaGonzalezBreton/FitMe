import {View, Text, Image, TouchableOpacity} from "react-native";

export default function ExerciseCard({
                                         name,
                                         details,
                                         checked = false,
                                         onToggle,
                                     }: {
    name: string;
    details: string;
    checked?: boolean;
    onToggle?: () => void;
}) {
    return (
        <View className="bg-cream flex-row items-center justify-between p-md mb-md rounded-xl">
            <View className="flex-row items-center gap-md">
                <Image
                    source={require("@/assets/mascotte.png")} // à adapter selon ton image
                    className="w-10 h-10"
                    resizeMode="contain"
                />
                <View>
                    <Text className="text-coffee font-semibold text-base">{name}</Text>
                    <Text className="text-mocha text-sm">{details}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={onToggle}
                className={`w-6 h-6 border-2 rounded-md ${
                    checked ? "bg-coffee border-coffee" : "border-coffee"
                }`}
            />
        </View>
    );
}
