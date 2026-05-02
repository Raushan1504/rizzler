import ChatScreen from '../../src/screens/Chat/ChatScreen';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function Chat() {
  const { id, name } = useLocalSearchParams();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatScreen matchId={id} matchName={name} />
    </>
  );
}
