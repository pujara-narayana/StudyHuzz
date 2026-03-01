import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal,
  TextInput, Alert, ActivityIndicator, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../lib/supabase';
import { COLORS, CITY_CAMPUS_BUILDINGS, EAST_CAMPUS_BUILDINGS } from '../../lib/constants';
import { StudyWindow, Campus } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatTime } from '../../lib/matching';

// Generate 7 days starting from today
function getNext7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDayLabel(d: Date): string {
  if (d.toDateString() === new Date().toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function ScheduleScreen() {
  const days = getNext7Days();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [windows, setWindows] = useState<StudyWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWindow, setEditingWindow] = useState<StudyWindow | null>(null);

  // Form state
  const [campus, setCampus] = useState<Campus>('city');
  const [building, setBuilding] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const fetchWindows = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const dateStr = toDateString(selectedDay);
    const { data } = await supabase
      .from('study_windows')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .order('start_time', { ascending: true });
    setWindows(data ?? []);
    setLoading(false);
  }, [userId, selectedDay]);

  useEffect(() => { fetchWindows(); }, [fetchWindows]);

  function openAddModal() {
    setEditingWindow(null);
    setCampus('city');
    setBuilding('');
    setSubjects([]);
    setSubjectInput('');
    const start = new Date();
    start.setHours(14, 0, 0, 0);
    const end = new Date();
    end.setHours(16, 0, 0, 0);
    setStartTime(start);
    setEndTime(end);
    setModalVisible(true);
  }

  function openEditModal(w: StudyWindow) {
    setEditingWindow(w);
    setCampus(w.campus);
    setBuilding(w.building_id);
    setSubjects(w.subjects);
    const [sh, sm] = w.start_time.split(':').map(Number);
    const [eh, em] = w.end_time.split(':').map(Number);
    const s = new Date(); s.setHours(sh, sm, 0, 0);
    const e = new Date(); e.setHours(eh, em, 0, 0);
    setStartTime(s);
    setEndTime(e);
    setModalVisible(true);
  }

  function addSubject() {
    const trimmed = subjectInput.trim();
    if (!trimmed || subjects.length >= 5) return;
    if (!subjects.includes(trimmed)) setSubjects([...subjects, trimmed]);
    setSubjectInput('');
  }

  function removeSubject(s: string) {
    setSubjects(subjects.filter((x) => x !== s));
  }

  function toTimeStr(d: Date): string {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  async function saveWindow() {
    if (!userId || !building || subjects.length === 0) {
      Alert.alert('Missing fields', 'Please select a building and add at least one subject.');
      return;
    }
    if (endTime <= startTime) {
      Alert.alert('Invalid time', 'End time must be after start time.');
      return;
    }

    setSaving(true);
    const dateStr = toDateString(selectedDay);

    const payload = {
      user_id: userId,
      date: dateStr,
      start_time: toTimeStr(startTime),
      end_time: toTimeStr(endTime),
      subjects,
      building_id: building,
      campus,
    };

    let error;
    if (editingWindow) {
      ({ error } = await supabase.from('study_windows').update(payload).eq('id', editingWindow.id));
    } else {
      ({ error } = await supabase.from('study_windows').insert(payload));
    }

    setSaving(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setModalVisible(false);
    fetchWindows();
  }

  async function deleteWindow(id: string) {
    Alert.alert('Delete window?', 'This will remove this study session.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('study_windows').delete().eq('id', id);
          fetchWindows();
        },
      },
    ]);
  }

  const buildings = campus === 'city' ? CITY_CAMPUS_BUILDINGS : EAST_CAMPUS_BUILDINGS;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Study Schedule</Text>
      </View>

      {/* Day Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >
        {days.map((d) => {
          const active = toDateString(d) === toDateString(selectedDay);
          return (
            <TouchableOpacity
              key={d.toISOString()}
              style={[styles.dayBtn, active && styles.dayBtnActive]}
              onPress={() => setSelectedDay(d)}
            >
              <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>
                {formatDayLabel(d)}
              </Text>
              <Text style={[styles.dayNum, active && styles.dayNumActive]}>
                {d.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Windows List */}
      <FlatList
        data={windows}
        keyExtractor={(w) => w.id}
        style={styles.list}
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 12 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No study sessions yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add a session</Text>
            </View>
          )
        }
        renderItem={({ item: w }) => (
          <View style={styles.windowCard}>
            <View style={styles.windowLeft}>
              <Text style={styles.windowTime}>
                {formatTime(w.start_time)} – {formatTime(w.end_time)}
              </Text>
              <View style={styles.windowLocation}>
                <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                <Text style={styles.windowBuilding}>{w.building_id}</Text>
                <View style={styles.campusBadge}>
                  <Text style={styles.campusBadgeText}>
                    {w.campus === 'city' ? 'City' : 'East'}
                  </Text>
                </View>
              </View>
              <View style={styles.subjectChips}>
                {w.subjects.map((s) => (
                  <View key={s} style={styles.chip}>
                    <Text style={styles.chipText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.windowActions}>
              <TouchableOpacity onPress={() => openEditModal(w)} style={styles.iconBtn}>
                <Ionicons name="pencil-outline" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteWindow(w.id)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingWindow ? 'Edit Session' : 'Add Study Session'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Date info */}
            <Text style={styles.modalDateLabel}>
              {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>

            {/* Times */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Start Time</Text>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setShowStartPicker(true)}>
                  <Text style={styles.timeBtnText}>{formatTime(toTimeStr(startTime))}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>End Time</Text>
                <TouchableOpacity style={styles.timeBtn} onPress={() => setShowEndPicker(true)}>
                  <Text style={styles.timeBtnText}>{formatTime(toTimeStr(endTime))}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                minuteInterval={15}
                onChange={(_, d) => { setShowStartPicker(false); if (d) setStartTime(d); }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                minuteInterval={15}
                onChange={(_, d) => { setShowEndPicker(false); if (d) setEndTime(d); }}
              />
            )}

            {/* Campus Toggle */}
            <Text style={styles.fieldLabel}>Campus</Text>
            <View style={styles.campusToggle}>
              {(['city', 'east'] as Campus[]).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.campusOption, campus === c && styles.campusOptionActive]}
                  onPress={() => { setCampus(c); setBuilding(''); }}
                >
                  <Text style={[styles.campusOptionText, campus === c && styles.campusOptionTextActive]}>
                    {c === 'city' ? 'City Campus' : 'East Campus'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Building */}
            <Text style={styles.fieldLabel}>Building</Text>
            <ScrollView style={styles.buildingList} nestedScrollEnabled>
              {buildings.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.buildingOption, building === b && styles.buildingOptionActive]}
                  onPress={() => setBuilding(b)}
                >
                  <Text style={[styles.buildingOptionText, building === b && styles.buildingOptionTextActive]}>
                    {b}
                  </Text>
                  {building === b && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Subjects */}
            <Text style={styles.fieldLabel}>Subjects / Topics (max 5)</Text>
            <View style={styles.subjectInputRow}>
              <TextInput
                style={styles.subjectInput}
                placeholder="e.g. Organic Chemistry"
                placeholderTextColor={COLORS.textSecondary}
                value={subjectInput}
                onChangeText={setSubjectInput}
                onSubmitEditing={addSubject}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addSubjectBtn} onPress={addSubject}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.subjectChips}>
              {subjects.map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, styles.chipRemovable]} onPress={() => removeSubject(s)}>
                  <Text style={styles.chipText}>{s}</Text>
                  <Ionicons name="close" size={12} color={COLORS.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={saveWindow}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>{editingWindow ? 'Save Changes' : 'Add Session'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  dayStrip: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dayBtn: {
    width: 52,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  dayBtnActive: { backgroundColor: COLORS.primary },
  dayLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  dayLabelActive: { color: '#fff' },
  dayNum: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginTop: 2 },
  dayNumActive: { color: '#fff' },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 17, color: COLORS.textPrimary, fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary },
  windowCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  windowLeft: { flex: 1, gap: 6 },
  windowTime: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  windowLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  windowBuilding: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  campusBadge: { backgroundColor: COLORS.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  campusBadgeText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  subjectChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  chip: { backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipRemovable: { flexDirection: 'row', alignItems: 'center' },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  windowActions: { gap: 8, justifyContent: 'center' },
  iconBtn: { padding: 6 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  modalContent: { padding: 20, gap: 14, paddingBottom: 60 },
  modalDateLabel: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeField: { flex: 1 },
  fieldLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  timeBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  timeBtnText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  campusToggle: { flexDirection: 'row', gap: 8 },
  campusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  campusOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  campusOptionText: { color: COLORS.textSecondary, fontWeight: '600' },
  campusOptionTextActive: { color: '#fff' },
  buildingList: { maxHeight: 160, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  buildingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  buildingOptionActive: { backgroundColor: COLORS.primary + '22' },
  buildingOptionText: { color: COLORS.textSecondary, fontSize: 14 },
  buildingOptionTextActive: { color: COLORS.textPrimary, fontWeight: '600' },
  subjectInputRow: { flexDirection: 'row', gap: 8 },
  subjectInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addSubjectBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
