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
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      <div className="flex h-[500px]">
        {/* Contact List */}
        <div
          className={`${
            selectedContact ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 flex-col border-r border-gray-100`}
        >
          <div className="p-4 border-b border-gray-100">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MessageCircle className="h-5 w-5 text-primary-500" /> Messages
            </h3>
          </div>

          {contacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-gray-400 text-center">
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
                      className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition ${
                        selectedContact?.id === contact.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-sm">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {currentRole === 'patient' ? `Dr. ${contact.name}` : contact.name}
                          </p>
                          {lastMsg && (
                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                              {formatTime(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 truncate">
                            {contact.subject && (
                              <span className="text-primary-500">{contact.subject} · </span>
                            )}
                            {lastMsg ? lastMsg.content : 'No messages yet'}
                          </p>
                          {unread > 0 && (
                            <span className="ml-2 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
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
          } flex-1 flex-col`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden rounded-lg p-1 hover:bg-gray-100 transition"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-sm">
                  {selectedContact.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {currentRole === 'patient'
                      ? `Dr. ${selectedContact.name}`
                      : selectedContact.name}
                  </p>
                  {selectedContact.subject && (
                    <p className="text-xs text-gray-400">{selectedContact.subject}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conversation.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-400">
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
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isOwn ? 'text-primary-200' : 'text-gray-400'
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
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-3 text-gray-400 text-sm">
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
