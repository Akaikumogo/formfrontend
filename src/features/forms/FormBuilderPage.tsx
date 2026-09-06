import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { formsApi } from '../../api/forms';
import { getErrorMessage } from '../../api/client';
import { PageHeader } from '../../components/ui';
import { FIELD_TYPE_LABELS, type FieldType, type FormField } from '../../types';
import { useAuth } from '../../hooks/useAuth';

function SortableItem({
  field,
  selected,
  onClick,
}: {
  field: FormField;
  selected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: selected ? '#1B4F8A' : '#D0D5DD',
    background: selected ? '#F0F5FA' : '#fff',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border px-3 py-2 mb-2 cursor-pointer"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="font-medium text-sm">{field.label}</div>
      <div className="text-xs text-slate-500">
        {FIELD_TYPE_LABELS[field.type]} {field.required ? '• majburiy' : ''}
      </div>
    </div>
  );
}

const fieldTypes = Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => ({
  value: value as FieldType,
  label,
}));

export default function FormBuilderPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const base = user?.role === 'SUPER_ADMIN' ? '/admin' : '/teacher';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [metaForm] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | undefined>(id);

  const { data: existing } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.get(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      metaForm.setFieldsValue({
        title: existing.title,
        description: existing.description,
        endsAt: existing.endsAt ? dayjs(existing.endsAt) : undefined,
        allowEditAfterSubmit: existing.allowEditAfterSubmit,
      });
      setFields(existing.fields || []);
      setFormId(existing.id);
    }
  }, [existing, metaForm]);

  const selected = fields.find((f) => f.id === selectedId) || null;

  useEffect(() => {
    if (selected) {
      fieldForm.setFieldsValue({
        ...selected,
        options: Array.isArray(selected.config?.options)
          ? (selected.config!.options as string[]).join('\n')
          : '',
      });
    }
  }, [selected, fieldForm]);

  const sensors = useSensors(useSensor(PointerSensor));

  const saveMeta = useMutation({
    mutationFn: async () => {
      const values = await metaForm.validateFields();
      const payload = {
        title: values.title,
        description: values.description,
        endsAt: values.endsAt ? values.endsAt.toISOString() : null,
        allowEditAfterSubmit: values.allowEditAfterSubmit,
      };
      if (formId) return formsApi.update(formId, payload);
      return formsApi.create(payload);
    },
    onSuccess: (data) => {
      setFormId(data.id);
      message.success('Saqlandi');
      qc.invalidateQueries({ queryKey: ['forms'] });
      if (!isEdit) navigate(`${base}/forms/${data.id}/edit`, { replace: true });
    },
    onError: (e) => message.error(getErrorMessage(e)),
  });

  const addField = async (type: FieldType) => {
    let currentId = formId;
    if (!currentId) {
      try {
        const created = await saveMeta.mutateAsync();
        currentId = created.id;
        setFormId(created.id);
      } catch {
        return;
      }
    }
    if (!currentId) {
      message.warning('Avval formani saqlang');
      return;
    }
    try {
      const key = `field_${Date.now()}`;
      const created = await formsApi.addField(currentId, {
        label: FIELD_TYPE_LABELS[type],
        key,
        type,
        required: false,
        config: {},
        order: fields.length,
      });
      setFields((prev) => [...prev, created]);
      setSelectedId(created.id);
      message.success("Maydon qo'shildi");
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const saveField = async () => {
    if (!formId || !selected) return;
    const values = await fieldForm.validateFields();
    const config: Record<string, unknown> = { ...(selected.config || {}) };
    if (values.options) {
      config.options = String(values.options)
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    try {
      const updated = await formsApi.updateField(formId, selected.id, {
        label: values.label,
        key: values.key,
        type: values.type,
        required: values.required,
        placeholder: values.placeholder,
        description: values.description,
        config,
      });
      setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      message.success('Maydon yangilandi');
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const deleteField = async () => {
    if (!formId || !selected) return;
    await formsApi.deleteField(formId, selected.id);
    setFields((prev) => prev.filter((f) => f.id !== selected.id));
    setSelectedId(null);
    message.success("O'chirildi");
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !formId) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    const next = arrayMove(fields, oldIndex, newIndex);
    setFields(next);
    try {
      const updated = await formsApi.reorderFields(
        formId,
        next.map((f) => f.id),
      );
      setFields(updated);
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  const publish = async () => {
    if (!formId) return;
    try {
      await saveMeta.mutateAsync();
      await formsApi.publish(formId);
      message.success('Forma nashr qilindi');
      navigate(`${base}/forms/${formId}`);
    } catch (e) {
      message.error(getErrorMessage(e));
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Formani tahrirlash' : 'Yangi forma'}
        extra={
          <Space>
            <Button loading={saveMeta.isPending} onClick={() => saveMeta.mutate()}>
              Saqlash
            </Button>
            <Button type="primary" onClick={publish}>
              Nashr qilish
            </Button>
          </Space>
        }
      />

      <div
        className="bg-white border p-4 mb-4"
        style={{ borderColor: '#D0D5DD' }}
      >
        <Form form={metaForm} layout="vertical">
          <div className="grid md:grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label="Sarlavha"
              rules={[{ required: true }]}
            >
              <Input placeholder="Masalan: Sentabr so‘rovi" />
            </Form.Item>
            <Form.Item name="endsAt" label="Muddat">
              <DatePicker className="w-full" showTime />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Tavsif">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="allowEditAfterSubmit"
            label="Yuborgandan keyin tahrirlash"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </div>

      <div className="grid md:grid-cols-[280px_1fr_320px] gap-4">
        <div className="bg-white border p-3" style={{ borderColor: '#D0D5DD' }}>
          <div className="text-xs uppercase text-slate-500 mb-2">
            Maydon qo‘shish
          </div>
          <Space wrap className="mb-4">
            {fieldTypes.slice(0, 6).map((t) => (
              <Button key={t.value} size="small" onClick={() => addField(t.value)}>
                + {t.label}
              </Button>
            ))}
          </Space>
          <div className="text-xs uppercase text-slate-500 mb-2">
            Maydonlar
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((f) => (
                <SortableItem
                  key={f.id}
                  field={f}
                  selected={f.id === selectedId}
                  onClick={() => setSelectedId(f.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="bg-white border p-4" style={{ borderColor: '#D0D5DD' }}>
          <div className="text-sm font-medium mb-3">Ko‘rinish</div>
          {fields.length === 0 && (
            <div className="text-slate-500 text-sm">
              Maydon qo‘shing va sozlang.
            </div>
          )}
          {fields.map((f) => (
            <div key={f.id} className="mb-4">
              <div className="font-medium">
                {f.label} {f.required && <span className="text-red-600">*</span>}
              </div>
              {f.description && (
                <div className="text-xs text-slate-500 mb-1">{f.description}</div>
              )}
              {f.type === 'LONG_TEXT' ? (
                <Input.TextArea disabled rows={2} placeholder={f.placeholder || ''} />
              ) : f.type === 'NUMBER' || f.type === 'RATING' ? (
                <InputNumber disabled className="w-full" />
              ) : (
                <Input disabled placeholder={f.placeholder || ''} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border p-4" style={{ borderColor: '#D0D5DD' }}>
          <div className="text-sm font-medium mb-3">Maydon sozlamalari</div>
          {!selected ? (
            <div className="text-slate-500 text-sm">Maydonni tanlang</div>
          ) : (
            <Form form={fieldForm} layout="vertical">
              <Form.Item name="label" label="Yorliq" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="key" label="Kalit" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="type" label="Tur" rules={[{ required: true }]}>
                <Select options={fieldTypes} />
              </Form.Item>
              <Form.Item name="required" label="Majburiy" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="placeholder" label="Placeholder">
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Tavsif">
                <Input.TextArea rows={2} />
              </Form.Item>
              {(selected.type === 'SINGLE_SELECT' ||
                selected.type === 'MULTI_SELECT') && (
                <Form.Item name="options" label="Variantlar (har qator)">
                  <Input.TextArea rows={4} />
                </Form.Item>
              )}
              <Space>
                <Button type="primary" onClick={saveField}>
                  Saqlash
                </Button>
                <Button danger onClick={deleteField}>
                  O‘chirish
                </Button>
              </Space>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
