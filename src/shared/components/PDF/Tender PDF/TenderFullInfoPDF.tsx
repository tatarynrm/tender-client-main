import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Реєстрація шрифтів з усіма накресленнями
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto", backgroundColor: "#fff" },

  // Header section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: 2,
    borderBottomColor: "#ea580c",
    paddingBottom: 15,
    marginBottom: 20,
  },
  brandName: { fontSize: 16, fontWeight: 700, color: "#1f2937" },
  tenderNumber: { fontSize: 14, fontWeight: 700, color: "#ea580c" },

  // Main Map
  map: { width: "100%", height: 280, borderRadius: 12, marginBottom: 25 },

  // Sections
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#6b7280",
    letterSpacing: 1,
    marginBottom: 10,
    borderLeft: 3,
    borderLeftColor: "#ea580c",
    paddingLeft: 8,
  },

  // Info Grid
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  gridItem: { width: "50%", marginBottom: 15 },
  label: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 11, fontWeight: 700, color: "#111827" },

  // Route
  routeContainer: { marginBottom: 20 },
  routeItem: {
    flexDirection: "row",
    marginBottom: 10,
    paddingLeft: 10,
    borderLeft: 1,
    borderLeftColor: "#e5e7eb",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ea580c",
    marginLeft: -13,
    marginRight: 7,
    marginTop: 4,
  },
  routeCity: { fontSize: 10, fontWeight: 700 },
  routeAddress: { fontSize: 9, color: "#4b5563" },

  // Footer/Notes
  notesBox: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  notesText: { fontSize: 9, color: "#92400e", lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTop: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 10,
    fontSize: 8,
    color: "#9ca3af",
  },
});

export const TenderFullInfoPDF = ({
  tender,
  mapImage,
}: {
  tender: any;
  mapImage: string;
}) => (
  <Document title={`Tender_${tender.id}_ICT_Zakhid`}>
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>ICT Захід</Text>
          <Text style={{ fontSize: 8, color: "#6b7280" }}>
            Логістична компанія
          </Text>
        </View>
        <Text style={styles.tenderNumber}>ТЕНДЕР №{tender.id}</Text>
      </View>

      {/* MAP */}
      {mapImage && <Image src={mapImage} style={styles.map} />}

      {/* CARGO INFO */}
      <Text style={styles.sectionTitle}>Деталі вантажу та транспорту</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Тип вантажу</Text>
          <Text style={styles.value}>{tender.cargo || "Не вказано"}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Параметри (Вага/Об'єм)</Text>
          <Text style={styles.value}>
            {tender.weight} т / {tender.volume} м³
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Транспорт</Text>
          <Text style={styles.value}>
            {tender.tender_trailer?.[0]?.trailer_type_name || "Тент / Стандарт"}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Кількість авто</Text>
          <Text style={styles.value}>{tender.car_count} одиниці</Text>
        </View>
      </View>

      {/* ROUTE */}
      <Text style={styles.sectionTitle}>Логістичний маршрут</Text>
      <View style={styles.routeContainer}>
        {tender.tender_route.map((r: any, idx: number) => (
          <View key={idx} style={styles.routeItem}>
            <View style={styles.dot} />
            <View>
              <Text style={styles.routeCity}>
                {idx === 0
                  ? "ПОЧАТОК: "
                  : idx === tender.tender_route.length - 1
                    ? "КІНЕЦЬ: "
                    : "ТОЧКА: "}
                {r.city}, {r.ids_country} ({r.point_name})
              </Text>
              <Text style={styles.routeAddress}>{r.address}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ADDITIONAL INFO */}
      <Text style={styles.sectionTitle}>Додаткові вимоги</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Типи завантаження</Text>
          <Text style={styles.value}>
            {tender.tender_load?.map((l: any) => l.load_type_name).join(", ") ||
              "Стандарт"}
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>Контактна особа</Text>
          <Text style={styles.value}>Відділ логістики ICT Захід</Text>
        </View>
      </View>

      {/* NOTES */}
      {tender.notes && (
        <View style={styles.notesBox}>
          <Text style={[styles.label, { color: "#92400e" }]}>
            Особливі примітки:
          </Text>
          <Text style={styles.notesText}>{tender.notes}</Text>
        </View>
      )}

      {/* FOOTER */}
      <Text style={styles.footer}>
        Цей документ згенеровано автоматично системою керування тендерами ICT
        Захід. © {new Date().getFullYear()} ICT Захід. Всі права захищені.
      </Text>
    </Page>
  </Document>
);
