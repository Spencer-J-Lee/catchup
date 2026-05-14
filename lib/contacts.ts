import * as Contacts from "expo-contacts";
import { Alert, Linking, Platform } from "react-native";

export interface ContactSnapshot {
  name: string | null;
  phone: string | null;
  email: string | null;
  phones: { label: string | null; number: string }[];
  emails: { label: string | null; email: string }[];
  image_uri: string | null;
}

export interface PickedContact {
  contact_id: string;
  snapshot: ContactSnapshot;
  avatar_url: string | null;
}

export interface ContactListItem {
  id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  image_uri: string | null;
  snapshot: ContactSnapshot;
}

function snapshotFromContact(contact: Contacts.Contact): ContactSnapshot {
  const phones = (contact.phoneNumbers ?? [])
    .map((p) => ({ label: p.label ?? null, number: p.number ?? "" }))
    .filter((p) => p.number);
  const emails = (contact.emails ?? [])
    .map((e) => ({ label: e.label ?? null, email: e.email ?? "" }))
    .filter((e) => e.email);
  const imageUri = contact.image?.uri ?? null;

  return {
    name: contact.name ?? null,
    phone: phones[0]?.number ?? null,
    email: emails[0]?.email ?? null,
    phones,
    emails,
    image_uri: imageUri,
  };
}

async function loadContactWithImage(
  contactId: string,
): Promise<Contacts.Contact | null> {
  try {
    const full = await Contacts.getContactByIdAsync(contactId, [
      Contacts.Fields.Name,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Emails,
      Contacts.Fields.Image,
      Contacts.Fields.ImageAvailable,
    ]);
    return full ?? null;
  } catch {
    return null;
  }
}

export async function requestContactsPermission(): Promise<Contacts.PermissionStatus> {
  const { status } = await Contacts.requestPermissionsAsync();
  return status;
}

export async function listContacts(): Promise<ContactListItem[]> {
  const { data } = await Contacts.getContactsAsync({
    fields: [
      Contacts.Fields.Name,
      Contacts.Fields.FirstName,
      Contacts.Fields.LastName,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Emails,
      Contacts.Fields.Image,
    ],
    sort: Contacts.SortTypes.FirstName,
  });
  const items: ContactListItem[] = [];
  for (const c of data) {
    if (!c.id) continue;
    const fallbackName =
      `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || c.name?.trim() || "";
    if (!fallbackName) continue;
    const snapshot = snapshotFromContact(c);
    items.push({
      id: c.id,
      display_name: fallbackName,
      first_name: c.firstName ?? null,
      last_name: c.lastName ?? null,
      phone: snapshot.phone,
      image_uri: snapshot.image_uri,
      snapshot,
    });
  }
  return items;
}

export async function pickContact(): Promise<PickedContact | null> {
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

  const picked = await Contacts.presentContactPickerAsync();
  if (!picked || !picked.id) return null;

  const enriched = (await loadContactWithImage(picked.id)) ?? picked;
  const snapshot = snapshotFromContact(enriched);

  return {
    contact_id: picked.id,
    snapshot,
    avatar_url: snapshot.image_uri,
  };
}

export function snapshotFrom(
  raw: Record<string, unknown> | null,
): ContactSnapshot | null {
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
    await Contacts.presentFormAsync(contactId, undefined, {
      allowsEditing: false,
    });
  } catch (e) {
    Alert.alert("Cannot open contact", (e as Error).message);
  }
}
