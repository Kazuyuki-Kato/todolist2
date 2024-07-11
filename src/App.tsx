import React, { useState } from "react";
import "./styles.css";

export type TodoItem = {
  id: number;
  text: string;
  done: boolean;
  subtasks?: TodoItem[];
};

type TodoListItemProps = {
  item: TodoItem;
  onCheck: (checked: boolean) => void;
  onDelete: () => void;
  onSubtaskAdd: (text: string) => void;
  onSubtaskUpdate: (subtask: TodoItem) => void;
  onSubtaskDelete: (subtaskId: number) => void;
  level?: number;
};

function TodoListItem({
  item,
  onCheck,
  onDelete,
  onSubtaskAdd,
  onSubtaskUpdate,
  onSubtaskDelete,
  level = 0,
}: TodoListItemProps) {
  const [newSubtask, setNewSubtask] = useState("");

  const handleSubtaskUpdate = (updatedSubtask: TodoItem) => {
    onSubtaskUpdate(updatedSubtask);
  };

  return (
    <div className={`TodoItem level-${level}`}>
      <div className="TodoItem-main">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(ev) => onCheck(ev.currentTarget.checked)}
        />
        <span style={{ textDecoration: item.done ? "line-through" : "none" }}>
          {item.text}
        </span>
        <button className="button-small" onClick={() => onDelete()}>
          削除
        </button>
      </div>
      {item.subtasks && (
        <div className="Subtasks">
          {item.subtasks.map((subtask) => (
            <TodoListItem
              key={subtask.id}
              item={subtask}
              onCheck={(checked) =>
                handleSubtaskUpdate({ ...subtask, done: checked })
              }
              onDelete={() => onSubtaskDelete(subtask.id)}
              onSubtaskAdd={() => {}}
              onSubtaskUpdate={handleSubtaskUpdate}
              onSubtaskDelete={() => {}}
              level={level + 1}
            />
          ))}
        </div>
      )}
      {level === 0 && (
        <div className="SubtaskForm">
          <input
            placeholder="新しいサブタスク"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
          />
          <button
            onClick={() => {
              if (newSubtask.trim()) {
                onSubtaskAdd(newSubtask);
                setNewSubtask("");
              }
            }}
          >
            サブタスク追加
          </button>
        </div>
      )}
    </div>
  );
}

type CreateTodoFormProps = {
  onSubmit: (text: string) => void;
};

function CreateTodoForm({ onSubmit }: CreateTodoFormProps) {
  const [text, setText] = useState("");
  return (
    <div className="CreateTodoForm">
      <input
        placeholder="新しいメインタスク"
        size={60}
        value={text}
        onChange={(ev) => setText(ev.currentTarget.value)}
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onSubmit(text);
            setText("");
          }
        }}
      >
        追加
      </button>
    </div>
  );
}

type ValueViewerProps = {
  value: any;
};

function ValueViewer({ value }: ValueViewerProps) {
  return (
    <pre className="ValueViewer">{JSON.stringify(value, undefined, 2)}</pre>
  );
}

const INITIAL_TODO: TodoItem[] = [
  {
    id: 1,
    text: "Java Silver学習",
    done: false,
    subtasks: [
      { id: 11, text: "基本文法の復習", done: false },
      { id: 12, text: "模擬試験の実施", done: false },
    ],
  },
  {
    id: 2,
    text: "React学習",
    done: true,
    subtasks: [
      { id: 13, text: "progate", done: false },
      { id: 14, text: "udemy", done: false },
      { id: 15, text: "個人アプリ作成", done: false },
    ],
  },
  {
    id: 3,
    text: "基本情報学習",
    done: true,
    subtasks: [
      { id: 16, text: "ソフトウェア", done: false },
      { id: 17, text: "ハードウェア", done: false },
    ],
  },
  {
    id: 4,
    text: "AWS学習",
    done: false,
    subtasks: [
      { id: 18, text: "ネットワーク関連のサービス", done: false },
      { id: 19, text: "コンピューティング関連のサービス", done: false },
    ],
  },
];

const generateId = () => Date.now();

const useTodoState = () => {
  const [todoItems, setTodoItems] = useState(INITIAL_TODO);

  const createItem = (text: string) => {
    setTodoItems([...todoItems, { id: generateId(), text, done: false }]);
  };

  const updateItem = (newItem: TodoItem) => {
    setTodoItems(
      todoItems.map((item) => (item.id === newItem.id ? newItem : item)),
    );
  };

  const deleteItem = (id: number) => {
    setTodoItems(todoItems.filter((item) => item.id !== id));
  };

  const addSubtask = (parentId: number, text: string) => {
    setTodoItems(
      todoItems.map((item) =>
        item.id === parentId
          ? {
              ...item,
              subtasks: [
                ...(item.subtasks || []),
                { id: generateId(), text, done: false },
              ],
            }
          : item,
      ),
    );
  };

  const updateSubtask = (parentId: number, updatedSubtask: TodoItem) => {
    setTodoItems(
      todoItems.map((item) => {
        if (item.id === parentId && item.subtasks) {
          const updatedSubtasks = item.subtasks.map((st) =>
            st.id === updatedSubtask.id ? updatedSubtask : st,
          );
          const allSubtasksDone = updatedSubtasks.every((st) => st.done);

          return {
            ...item,
            subtasks: updatedSubtasks,
            done: allSubtasksDone,
          };
        }
        return item;
      }),
    );
  };

  const deleteSubtask = (parentId: number, subtaskId: number) => {
    setTodoItems(
      todoItems.map((item) =>
        item.id === parentId
          ? {
              ...item,
              subtasks: item.subtasks?.filter((st) => st.id !== subtaskId),
            }
          : item,
      ),
    );
  };

  return [
    todoItems,
    createItem,
    updateItem,
    deleteItem,
    addSubtask,
    updateSubtask,
    deleteSubtask,
  ] as const;
};

export default function App() {
  const [
    todoItems,
    createItem,
    updateItem,
    deleteItem,
    addSubtask,
    updateSubtask,
    deleteSubtask,
  ] = useTodoState();
  const [keyword, setKeyword] = useState("");
  const [showingDone, setShowingDone] = useState(true);

  const filteredTodoItems = todoItems.filter((item) => {
    if (!showingDone && item.done) return false;
    return item.text.includes(keyword);
  });

  return (
    <div className="App">
      <h1>学習進捗リスト</h1>
      <div className="App_todo-list-control">
        <input
          placeholder="キーワードフィルタ"
          value={keyword}
          onChange={(ev) => setKeyword(ev.target.value)}
        />
        <input
          id="showing-done"
          type="checkbox"
          checked={showingDone}
          onChange={(ev) => setShowingDone(ev.target.checked)}
        />
        <label htmlFor="showing-done">完了したものも表示する</label>
      </div>
      {filteredTodoItems.length === 0 ? (
        <div className="dimmed">該当するToDoはありません</div>
      ) : (
        <div className="App_todo-list">
          {filteredTodoItems.map((item) => (
            <TodoListItem
              key={item.id}
              item={item}
              onCheck={(checked) => {
                updateItem({ ...item, done: checked });
              }}
              onDelete={() => deleteItem(item.id)}
              onSubtaskAdd={(text) => addSubtask(item.id, text)}
              onSubtaskUpdate={(subtask) => updateSubtask(item.id, subtask)}
              onSubtaskDelete={(subtaskId) => deleteSubtask(item.id, subtaskId)}
            />
          ))}
        </div>
      )}
      <CreateTodoForm onSubmit={(text: string) => createItem(text)} />
      <ValueViewer
        value={{ keyword, showingDone, todoItems, filteredTodoItems }}
      />
    </div>
  );
}
