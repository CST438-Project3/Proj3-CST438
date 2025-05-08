import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';


export default function PlantopediaDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [plant, setPlant] = useState<any>(null);

    useEffect(() => {
        const fetchPlant = async () => {
        const { data, error } = await supabase
            .from('plant')
            .select('*')
            .eq('id', id)
            .single();

            if (error) console.error('Error fetching plant:', error);
            else setPlant(data);
            };

        if (id) fetchPlant();
    }, [id]);

    if (!plant) {
        return (
        <View style={styles.center}>
            <Text>Loading...</Text>
        </View>
        );
    }

    const handleAddPlant = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('You must be logged in to add plants.');
            return;
        }

        const { error } = await supabase.from('collection').insert({
            userId: user.id,
            plantId: plant.id,
        });

        if (error) {
            console.error('Error adding plant:', error.message);
            alert('Failed to add plant.');
        } else {
            alert(`${plant.plantName} added to your collection!`);
        }
    };

    return (
        <ImageBackground
            source={require('@/assets/images/leaf-background.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView contentContainerStyle={styles.content}>
                {/* Header Bar */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={20} color="#333" />
                        </TouchableOpacity>
                        <Image
                            source={require('@/assets/images/iWetMyPlants Logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Plant Image */}
                    {plant.imageUrl && (
                        <Image source={{ uri: plant.imageUrl }} style={styles.image} />
                    )}

                    {/* Name & Scientific Name */}
                    <Text style={styles.name}>{plant.plantName}</Text>
                    {plant.scientificName && (
                        <Text style={styles.scientific}>
                            <Ionicons name="book-outline" size={14} />{' '}
                            <Text style={{ fontStyle: 'italic' }}>{plant.scientificName}</Text>
                        </Text>
                    )}

                    {/* Details Card */}
                    <View style={styles.card}>
                        {plant.duration && (
                            <Text style={styles.detail}>⏳ Duration: {plant.duration}</Text>
                        )}
                        {plant.growthRate && (
                            <Text style={styles.detail}>🌱 Growth Rate: {plant.growthRate}</Text>
                        )}
                        {plant.light !== undefined && (
                            <Text style={styles.detail}>☀️ Light Rating: {plant.light}/10</Text>
                        )}
                        {plant.minTemp !== undefined && plant.maxTemp !== undefined && (
                            <Text style={styles.detail}>
                            🌡️ Temperature Range: {plant.minTemp}–{plant.maxTemp}°F
                        </Text>
                        )}
                        {plant.minPrecip !== undefined && plant.maxPrecip !== undefined && (
                        <Text style={styles.detail}>
                            💧 Watering: {Math.round((plant.minPrecip / 52) * 0.05 * 100) / 100}–{Math.round((plant.maxPrecip / 52) * 0.05 * 100) / 100} L/week
                        </Text>
                        )}

                        <TouchableOpacity style={styles.addButton} onPress={handleAddPlant}>
                            <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.addButtonText}>Add to My Plants</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
        backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
        content: {
        padding: 16,
        alignItems: 'center',
    },
        header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        },
        backButton: {
        padding: 8,
    },
        logo: {
        width: 36,
        height: 36,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
        image: {
        width: '100%',
        height: 220,
        borderRadius: 12,
        marginBottom: 16,
    },
        name: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 4,
    },
        scientific: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 12,
    },
        card: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
        detail: {
        fontSize: 16,
        color: '#333',
    },
        center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
        addButton: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2e7d32',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
        addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});