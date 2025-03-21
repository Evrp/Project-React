export function Button({ children, ...props }) {
    return <button className="px-4 py-2 bg-blue-500 text-white rounded" {...props}>{children}</button>;
  }
  
  export function Input({ ...props }) {
    return <input className="border p-2 w-full rounded" {...props} />;
  }
  
  export function Select({ children, ...props }) {
    return <select className="border p-2 w-full rounded" {...props}>{children}</select>;
  }
  