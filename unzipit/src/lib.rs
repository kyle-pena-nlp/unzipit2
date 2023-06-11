use rc_zip::reader::sync::SyncArchive;
use wasm_bindgen::prelude::*;
use web_sys::console;
use rc_zip::{prelude::*};
use std::io::Cursor;
use std::io::{Read};
use wasm_bindgen::JsCast;
use js_sys::Uint8Array;
use js_sys::WebAssembly;
use js_sys::Array;
use serde::{Serialize, Deserialize};

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize)]
pub struct ZipDirectory {
    pub file_names : Vec<String>,
}

#[wasm_bindgen]
pub struct JsFile {
    file_bytes: Uint8Array,
    file_name: String,
}

#[wasm_bindgen]
impl JsFile {
    #[wasm_bindgen(constructor)]
    pub fn new(file_bytes: Uint8Array, file_name: String) -> JsFile {
        JsFile { file_bytes, file_name }
    }

    #[wasm_bindgen(getter)]
    pub fn file_bytes(&self) -> Uint8Array {
        self.file_bytes.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn file_name(&self) -> String {
        self.file_name.clone()
    }
}


#[wasm_bindgen]
pub fn list_files(data: &[u8]) -> Result<JsValue, JsValue> {

    //let reader = make_reader(data);

    let reader =data.read_zip().unwrap();

    let mut file_names = Vec::<String>::new();

    for entry in reader.entries() {
        match entry.contents() {
            rc_zip::EntryContents::Symlink => {
            }
            rc_zip::EntryContents::Directory => {
            }
            rc_zip::EntryContents::File => {
                file_names.push(entry.entry.name.clone());
            }
        }        
    }
    Ok(JsValue::from_serde(& ZipDirectory { file_names : file_names }).unwrap())
}


#[wasm_bindgen]
pub fn unzip_file(data: &[u8], file_name: String) -> Result<JsFile, JsValue> {

    let reader =data.read_zip().unwrap();

    for entry in reader.entries() {
        match entry.contents() {
            rc_zip::EntryContents::Symlink => {
            }
            rc_zip::EntryContents::Directory => {
            }
            rc_zip::EntryContents::File => {
                if (entry.entry.name == file_name) {
                    let bytes = entry.bytes().unwrap();
                    let js_array = send_vec_to_js(bytes);
                    console::log_1(&JsValue::from_str("read a file"));
                    let js_file = JsFile { file_bytes: js_array, file_name: entry.entry.name.clone() };
                    return Ok::<JsFile,JsValue>(js_file);
                }
            }
        }
    }

    Err(JsValue::from_str("No files found in zip"))
}


pub fn send_vec_to_js(input: Vec<u8>) -> Uint8Array {
    // Convert the Vec<u8> into a boxed slice
    let boxed_slice = input.into_boxed_slice();
    // Convert the boxed slice into a JsValue
    let memory_buffer = wasm_bindgen::memory()
        .dyn_into::<WebAssembly::Memory>()
        .unwrap()
        .buffer();

    // Create a Uint8Array from the memory buffer
    Uint8Array::new(&memory_buffer)
        .subarray(boxed_slice.as_ptr() as u32, (boxed_slice.as_ptr() as u32) + boxed_slice.len() as u32)
}

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();


    // Your code goes here!
    console::log_1(&JsValue::from_str("Hello world!"));

    Ok(())
}
