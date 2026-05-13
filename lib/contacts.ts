import * as Contacts from "expo-contacts";
import { Alert, Linking, Platform } from "react-native";

export interface ContactSnapshot {
  name: string | null;
  phone: string | null;
  email: string | null;
  phones: { label: string | null; number: string }[];
  emails: { label: string | null; email: string }[];
}

export async function pickContact(): Promise<
  { contact_id: string; snapshot: ContactSnapshot } | null
> {
  if (Platform.OS === "android") {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "CatchUp needs access to your contacts to link a friend.",
      );
      return null;
    }
  }

  const contact = await Contacts.presentContactPickerAsync();
  if (!contact || !contact.id) return null;

  const phones = (contact.phoneNumbers ?? [])
    .map((p) => ({ label: p.label ?? null, number: p.number ?? "" }))
    .filter((p) => p.number);
  const emails = (contact.emails ?? [])
    .map((e) => ({ label: e.label ?? null, email: e.email ?? "" }))
    .filter((e) => e.email);

  const snapshot: ContactSnapshot = {
    name: contact.name ?? null,
    phone: phones[0]?.number ?? null,
    email: emails[0]?.email ?? null,
    phones,
    emails,
  };

  return { contact_id: contact.id, snapshot };
}

export function snapshotFrom(raw: Record<string, unknown> | null): ContactSnapshot | null {
  if (!raw) return null;
  return raw as unknown as ContactSnapshot;
}

export function openMessage(phone: string) {
  const url = Platform.OS === "ios" ? `sms:${phone}` : `sms:${phone}`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Cannot open Messages", "No SMS app is available."),
  );
}

export function openCall(phone: string) {
  Linking.openURL(`tel:${phone}`).catch(() =>
    Alert.alert("Cannot place call", "No phone app is available."),
  );
}

export async function openContactCard(contactId: string) {
  try {
    await Contacts.presentFormAsync(contactId, undefined, { allowsEditing: false });
  } catch (e) {
    Alert.alert("Cannot open contact", (e as Error).message);
  }
}
