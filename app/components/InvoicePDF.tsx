import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const MONTHS = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#0b0f10',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'black',
    color: '#0b0f10',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 140,
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  totalBox: {
    marginTop: 10,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 24,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 15,
    flexDirection: 'row',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

type InvoiceProps = {
  bill: any;
  status: string;
};

const InvoicePDF = ({ bill, status }: InvoiceProps) => {
  const getStatusColor = (s: string) => {
    if (s === "LUNAS") return '#10b981';
    if (s === "MENUNGGU VERIFIKASI") return '#f59e0b';
    return '#ef4444';
  };

  const totalAmount = bill.amount ?? (bill.usage_value && bill.service?.price ? bill.usage_value * bill.service.price : 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>PDAM SMART</Text>
          <Text style={styles.subtitle}>INVOICE TAGIHAN AIR</Text>
        </View>

        <View style={{ marginBottom: 25 }}>
          <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nama Pelanggan</Text>
            <Text style={styles.value}>{bill.customer?.name ?? `ID: ${bill.customer_id}`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>No. Pelanggan (NIK)</Text>
            <Text style={styles.value}>{bill.customer?.customer_number ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nomor Meter</Text>
            <Text style={styles.value}>{bill.measurement_number}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>Detail Tagihan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>No. Invoice</Text>
            <Text style={styles.value}>INV-{bill.id}-{bill.month}{bill.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Periode Tagihan</Text>
            <Text style={styles.value}>{MONTHS[bill.month]} {bill.year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kategori Layanan</Text>
            <Text style={styles.value}>{bill.service?.name ?? "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pemakaian (m³)</Text>
            <Text style={styles.value}>{bill.usage_value} m³</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Harga per m³</Text>
            <Text style={styles.value}>{fmt(bill.price ?? bill.service?.price ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Tagihan</Text>
            <Text style={styles.totalValue}>{fmt(totalAmount)}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Dokumen ini dicetak secara otomatis dari sistem PDAM Smart pada {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}.
          Terima kasih telah menggunakan layanan kami.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
