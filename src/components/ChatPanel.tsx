import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: 'doctor' | 'patient';
  subject?: string;
}

export default function ChatPanel() {
  const { currentUser, currentRole, messages, doctors, patients, sendMessage, appointments } =
    useApp();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build contact list based on role — only show people you have appointments with
  const contacts: Contact[] = (() => {
    if (!currentUser) return [];

    if (currentRole === 'doctor') {
      // Show patients who have appointments with this doctor
      const patientIds = new Set(
        appointments
          .filter((a) => a.doctorId === currentUser.id)
          .map((a) => a.patientId)
      );
      return patients
        .filter((p) => patientIds.has(p.id))
        .map((p) => ({ id: p.id, name: p.name, role: 'patient' as const }));
    }

    // Patient: show doctors they have appointments with
    const doctorIds = new Set(
      appointments
        .filter((a) => a.patientId === currentUser.id)
        .map((a) => a.doctorId)
    );
    return doctors
      .filter((d) => doctorIds.has(d.id))
      .map((d) => ({ id: d.id, name: d.name, role: 'doctor' as const, subject: d.subject }));
  })();

  // Get conversation with selected contact
  const conversation = selectedContact
    ? messages
        .filter(
          (m) =>
            (m.senderId === currentUser?.id && m.receiverId === selectedContact.id) ||
            (m.senderId === selectedContact.id && m.receiverId === currentUser?.id)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  // Get last message for each contact (for preview)
  const lastMessageFor = (contactId: string) => {
    const msgs = messages
      .filter(
        (m) =>
          (m.senderId === currentUser?.id && m.receiverId === contactId) ||
          (m.senderId === contactId && m.receiverId === currentUser?.id)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return msgs[0];
  };

  // Unread count (messages from contact that are newer than any message sent to them)
  const unreadCount = (contactId: string) => {
    const fromContact = messages.filter(
      (m) => m.senderId === contactId && m.receiverId === currentUser?.id
    );
    return fromContact.length;
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.length]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    setSending(true);
    try {
      await sendMessage(selectedContact.id, selectedContact.name, newMessage.trim());
      setNewMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
      <div className="flex h-[480px]">
        {/* Contact List */}
        <div
          className={`${
            selectedContact ? 'hidden md:flex' : 'flex'
          } w-full md:w-72 flex-col border-r border-slate-200`}
        >
          <div className="p-4 border-b border-slate-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-teal-600" />
              </div>
              Messages
            </h3>
          </div>

          {contacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-slate-400 text-center">
                No conversations yet.
                <br />
                {currentRole === 'patient'
                  ? 'Book an appointment to start chatting with a doctor.'
                  : 'Your patients will appear here after they book an appointment.'}
              </p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {contacts.map((contact) => {
                const lastMsg = lastMessageFor(contact.id);
                const unread = unreadCount(contact.id);
                return (
                  <li key={contact.id}>
                    <button
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition ${
                        selectedContact?.id === contact.id ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 text-sm truncate">
                            {currentRole === 'patient' ? `Dr. ${contact.name}` : contact.name}
                          </p>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {formatTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400 truncate">
                            {contact.subject && (
                              <span className="text-teal-600">{contact.subject} · </span>
                            )}
                            {lastMsg ? lastMsg.content : 'No messages yet'}
                          </p>
                          {unread > 0 && (
                            <span className="ml-2 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Chat Area */}
        <div
          className={`${
            selectedContact ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-slate-50`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-slate-200 p-4 bg-white">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden rounded-lg p-1 hover:bg-slate-100 transition"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500" />
                </button>
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold text-sm">
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    {currentRole === 'patient'
                      ? `Dr. ${selectedContact.name}`
                      : selectedContact.name}
                  </p>
                  {selectedContact.subject && (
                    <p className="text-xs text-slate-400">{selectedContact.subject}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversation.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-slate-400">
                      Start the conversation — say hello!
                    </p>
                  </div>
                ) : (
                  conversation.map((msg) => {
                    const isOwn = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            isOwn
                              ? 'bg-teal-600 text-white rounded-br-md'
                              : 'bg-white text-slate-800 rounded-bl-md border border-slate-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isOwn ? 'text-teal-200' : 'text-slate-400'
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-4 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    rows={1}
                    className="flex-1 resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 text-slate-400 text-sm">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
