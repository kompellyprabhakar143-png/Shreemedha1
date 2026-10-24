import React, { useState, useEffect } from "react";

const STORAGE_KEY = "shreemedha_studyhall_students";

const initialStudents = [
  {
    id: 1,
    name: "Kompelli Prasad",
    mobile: "9908440035",
    amount: 1500,
    joinDate: "2026-10-01",
    dueDate: "2026-11-05",
    status: "Pending",
  },
  {
    id: 2,
    name: "Lavanya",
    mobile: "8179341203",
    amount: 1500,
    joinDate: "2026-09-25",
    dueDate: "2026-11-01",
    status: "Paid",
  },
];

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialStudents;
    }
  } catch (error) {
    console.error("Unable to load student records:", error);
  }

  return initialStudents;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("en-IN");
}

function createReminderMessage(student) {
  return (
    `Dear Student and Aspirant ${student.name}, ` +
    `this is a gentle reminder from Shree Medha Study Hall. ` +
    `Your joining date was ${formatDate(student.joinDate)}, ` +
    `and your study hall fee of ₹${formatAmount(student.amount)} ` +
    `is due on ${formatDate(student.dueDate)}. ` +
    `Kindly clear your dues on or before the due date. Thank you!`
  );
}

function openWhatsApp(student) {
  const mobile = String(student.mobile || "").replace(/\D/g, "");

  if (!/^\d{10}$/.test(mobile)) {
    alert(
      `Please check the 10-digit mobile number for ${student.name}.`
    );
    return;
  }

  const message = createReminderMessage(student);
  const url =
    `https://wa.me/91${mobile}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

export default function StudyHallPayments() {
  const [students, setStudents] = useState(loadStudents);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    amount: "",
    joinDate: "",
    dueDate: "",
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error("Unable to save student records:", error);
      setNotice("Unable to save records. Please check browser storage.");
    }
  }, [students]);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const mobile = form.mobile.replace(/\D/g, "");
    const amount = Number(form.amount);

    if (!name || !form.joinDate || !form.dueDate) {
      setNotice("Please fill in all the required fields.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setNotice("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice("Please enter a valid fee amount.");
      return;
    }

    if (form.dueDate < form.joinDate) {
      setNotice("The due date cannot be earlier than the joining date.");
      return;
    }

    const newStudent = {
      id: Date.now(),
      name,
      mobile,
      amount,
      joinDate: form.joinDate,
      dueDate: form.dueDate,
      status: "Pending",
    };

    setStudents((previous) => [newStudent, ...previous]);

    setForm({
      name: "",
      mobile: "",
      amount: "",
      joinDate: "",
      dueDate: "",
    });

    setNotice(`${name} has been added successfully.`);
  };

  const toggleStatus = (id) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.id === id
          ? {
              ...student,
              status:
                student.status === "Paid" ? "Pending" : "Paid",
            }
          : student
      )
    );

    setNotice("Student payment status updated.");
  };

  const deleteStudent = (id) => {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Delete the record for ${student.name}?`
    );

    if (!confirmed) return;

    setStudents((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setNotice("Student record deleted.");
  };

  const sendSingleAlert = (student) => {
    openWhatsApp(student);
  };

  const sendAllPendingAlerts = () => {
    const pendingStudents = students.filter(
      (student) => student.status === "Pending"
    );

    if (pendingStudents.length === 0) {
      alert("There are no pending student payments.");
      return;
    }

    const confirmed = window.confirm(
      `You have ${pendingStudents.length} pending student(s).\n\n` +
        "WhatsApp will open for each student. " +
        "Please send each message manually."
    );

    if (!confirmed) return;

    // Open one WhatsApp reminder at a time.
    // This helps avoid browser popup blocking.
    openWhatsApp(pendingStudents[0]);

    if (pendingStudents.length > 1) {
      let index = 1;

      const openNext = () => {
        if (index >= pendingStudents.length) return;

        const student = pendingStudents[index];

        const nextConfirmed = window.confirm(
          `Open WhatsApp reminder for ${student.name}?\n\n` +
            `${index + 1} of ${pendingStudents.length}`
        );

        if (nextConfirmed) {
          openWhatsApp(student);
        }

        index++;

        if (index < pendingStudents.length) {
          openNext();
        }
      };

      // The next reminder is opened after the user confirms.
      window.setTimeout(openNext, 300);
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.mobile.includes(query);

    const matchesFilter =
      filter === "All" || student.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalFees = students.reduce(
    (total, student) => total + Number(student.amount || 0),
    0
  );

  const paidFees = students
    .filter((student) => student.status === "Paid")
    .reduce(
      (total, student) => total + Number(student.amount || 0),
      0
    );

  const pendingFees = students
    .filter((student) => student.status === "Pending")
    .reduce(
      (total, student) => total + Number(student.amount || 0),
      0
    );

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.banner}>
          <div style={styles.bannerContent}>
            <div style={styles.brandIcon}>SM</div>

            <p style={styles.eyebrow}>
              QUIET ENVIRONMENT • HIGH PRODUCTIVITY
            </p>

            <h1 style={styles.title}>
              Shree Medha
              <span style={styles.highlight}> StudyHall</span>
            </h1>

            <p style={styles.subtitle}>
              Student Fee Management & Payment Reminders
            </p>
          </div>
        </header>

        {notice && (
          <div style={styles.notice} role="status">
            <span>{notice}</span>
            <button
              type="button"
              style={styles.noticeClose}
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}

        <section style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={students.length}
            color="#2563eb"
            icon="👨‍🎓"
          />

          <StatCard
            title="Total Fees"
            value={`₹${formatAmount(totalFees)}`}
            color="#7c3aed"
            icon="💰"
          />

          <StatCard
            title="Fees Collected"
            value={`₹${formatAmount(paidFees)}`}
            color="#059669"
            icon="✅"
          />

          <StatCard
            title="Pending Fees"
            value={`₹${formatAmount(pendingFees)}`}
            color="#dc2626"
            icon="⏳"
          />
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.cardTitle}>Add New Student</h2>
              <p style={styles.muted}>
                Enter student details and monthly fee information.
              </p>
            </div>

            <span style={styles.headingIcon}>＋</span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <FormField label="Student Name">
              <input
                type="text"
                placeholder="Enter student name"
                value={form.name}
                onChange={(event) =>
                  updateForm("name", event.target.value)
                }
                style={styles.input}
                required
              />
            </FormField>

            <FormField label="Mobile Number">
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={(event) =>
                  updateForm(
                    "mobile",
                    event.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                style={styles.input}
                maxLength={10}
                required
              />
            </FormField>

            <FormField label="Monthly Fee (₹)">
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1500"
                value={form.amount}
                onChange={(event) =>
                  updateForm("amount", event.target.value)
                }
                style={styles.input}
                required
              />
            </FormField>

            <FormField label="Joining Date">
              <input
                type="date"
                value={form.joinDate}
                onChange={(event) =>
                  updateForm("joinDate", event.target.value)
                }
                style={styles.input}
                required
              />
            </FormField>

            <FormField label="Fee Due Date">
              <input
                type="date"
                min={form.joinDate || undefined}
                value={form.dueDate}
                onChange={(event) =>
                  updateForm("dueDate", event.target.value)
                }
                style={styles.input}
                required
              />
            </FormField>

            <div style={styles.formButtonWrapper}>
              <button type="submit" style={styles.addButton}>
                ＋ Add Student
              </button>
            </div>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={styles.cardTitle}>Payment Records</h2>
              <p style={styles.muted}>
                Manage student fees and send WhatsApp reminders.
              </p>
            </div>

            <button
              type="button"
              onClick={sendAllPendingAlerts}
              style={styles.bulkButton}
            >
              💬 Remind Pending Students
            </button>
          </div>

          <div style={styles.toolbar}>
            <input
              type="search"
              placeholder="Search by student name or mobile..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.searchInput}
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              style={styles.select}
              aria-label="Filter payment status"
            >
              <option value="All">All Students</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Fee Amount</th>
                  <th style={styles.th}>Join Date</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={styles.empty}>
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={styles.td}>
                        <strong style={styles.studentName}>
                          {student.name}
                        </strong>
                      </td>

                      <td style={styles.td}>{student.mobile}</td>

                      <td style={styles.amountCell}>
                        ₹{formatAmount(student.amount)}
                      </td>

                      <td style={styles.td}>
                        {formatDate(student.joinDate)}
                      </td>

                      <td style={styles.td}>
                        {formatDate(student.dueDate)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...(student.status === "Paid"
                              ? styles.paidBadge
                              : styles.pendingBadge),
                          }}
                        >
                          {student.status === "Paid"
                            ? "✓ Paid"
                            : "● Pending"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            type="button"
                            onClick={() => toggleStatus(student.id)}
                            style={styles.statusButton}
                          >
                            {student.status === "Paid"
                              ? "Mark Pending"
                              : "Mark Paid"}
                          </button>

                          <button
                            type="button"
                            onClick={() => sendSingleAlert(student)}
                            style={styles.whatsappButton}
                          >
                            WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteStudent(student.id)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.tableFooter}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </section>

        <footer style={styles.footer}>
          <strong>Shree Medha StudyHall</strong>
          <span>Student Fee Management Dashboard</span>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, color }}>
        {icon}
      </div>

      <div style={styles.statText}>
        <p style={styles.statTitle}>{title}</p>
        <h3 style={{ ...styles.statValue, color }}>{value}</h3>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    padding: "20px 12px",
    boxSizing: "border-box",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#1e293b",
  },

  container: {
    maxWidth: "1250px",
    margin: "0 auto",
  },

  banner: {
    position: "relative",
    overflow: "hidden",
    backgroundImage:
      "linear-gradient(120deg, rgba(15,23,42,0.96), rgba(30,64,175,0.88)), url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "18px",
    padding: "36px 24px",
    color: "#ffffff",
    marginBottom: "22px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.14)",
    boxSizing: "border-box",
  },

  bannerContent: {
    textAlign: "center",
  },

  brandIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
    backgroundColor: "#38bdf8",
    color: "#082f49",
    fontWeight: "900",
    fontSize: "19px",
  },

  eyebrow: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#bae6fd",
    fontWeight: "700",
    margin: "0 0 12px",
  },

  title: {
    fontSize: "clamp(26px, 5vw, 42px)",
    fontWeight: "800",
    margin: "0 0 10px",
    lineHeight: 1.2,
  },

  highlight: {
    color: "#38bdf8",
  },

  subtitle: {
    color: "#dbeafe",
    fontSize: "14px",
    margin: 0,
    lineHeight: 1.6,
  },

  notice: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    marginBottom: "18px",
    borderRadius: "10px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    fontSize: "13px",
    fontWeight: "600",
  },

  noticeClose: {
    border: "none",
    background: "transparent",
    fontSize: "22px",
    cursor: "pointer",
    color: "#1e40af",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 3px 10px rgba(15,23,42,0.03)",
    minWidth: 0,
  },

  statIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    fontSize: "21px",
    flexShrink: 0,
  },

  statText: {
    minWidth: 0,
  },

  statTitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 7px",
    fontWeight: "600",
  },

  statValue: {
    fontSize: "clamp(19px, 2.5vw, 25px)",
    margin: 0,
    fontWeight: "800",
    overflowWrap: "anywhere",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "clamp(16px, 3vw, 26px)",
    borderRadius: "16px",
    marginBottom: "22px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 5px 18px rgba(15,23,42,0.04)",
    boxSizing: "border-box",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginBottom: "22px",
  },

  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px",
  },

  muted: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.6,
  },

  headingIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    backgroundColor: "#dbeafe",
    color: "#2563eb",
    borderRadius: "10px",
    fontSize: "25px",
    fontWeight: "600",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    alignItems: "end",
  },

  field: {
    minWidth: 0,
  },

  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    height: "43px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    fontSize: "13px",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    boxSizing: "border-box",
    outline: "none",
  },

  formButtonWrapper: {
    display: "flex",
    alignItems: "end",
  },

  addButton: {
    width: "100%",
    minHeight: "43px",
    padding: "11px 16px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  bulkButton: {
    minHeight: "42px",
    padding: "11px 16px",
    backgroundColor: "#15803d",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  toolbar: {
    display: "flex",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  searchInput: {
    flex: "1 1 240px",
    minWidth: 0,
    height: "42px",
    padding: "10px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  select: {
    minWidth: "140px",
    height: "42px",
    padding: "9px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    boxSizing: "border-box",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },

  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    padding: "14px 12px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 12px",
    fontSize: "12px",
    color: "#475569",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },

  studentName: {
    color: "#0f172a",
    fontSize: "13px",
  },

  amountCell: {
    padding: "14px 12px",
    fontSize: "13px",
    fontWeight: "800",
    color: "#047857",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
  },

  paidBadge: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },

  pendingBadge: {
    color: "#9a3412",
    backgroundColor: "#ffedd5",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
  },

  statusButton: {
    padding: "7px 9px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  whatsappButton: {
    padding: "7px 9px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "7px 9px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  empty: {
    padding: "35px 15px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
  },

  tableFooter: {
    paddingTop: "14px",
    fontSize: "12px",
    color: "#64748b",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    padding: "10px 4px",
    color: "#64748b",
    fontSize: "12px",
  },
};