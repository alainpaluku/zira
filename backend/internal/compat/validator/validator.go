package validator

import "reflect"

// Validate is the narrow API used by Gin's default binder. ZIRA validates
// request invariants explicitly in its application handlers, so this adapter
// avoids pulling an unused generic validation engine into the standalone API.
type Validate struct{}

func New() *Validate { return &Validate{} }
func (v *Validate) SetTagName(_ string) {}
func (v *Validate) Struct(_ any) error { return nil }

type StructLevel interface{}
type FieldLevel interface {
	Field() reflect.Value
}